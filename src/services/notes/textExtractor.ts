import { supabase } from "../supabase/client";
import * as FileSystem from "expo-file-system/legacy";

interface ExtractionResult {
  text: string;
  sourceType: string;
  pageCount?: number;
  error?: string;
}

interface OfflineQueueItem {
  id: string;
  noteId: string;
  fileUri: string;
  fileName: string;
  sourceType: "pdf" | "docx" | "image";
}

const OFFLINE_QUEUE_KEY = "offline_extraction_queue";
const QUEUE_FILE = (FileSystem.documentDirectory || "") + OFFLINE_QUEUE_KEY;

export async function extractTextFromFile(
  fileUri: string,
  fileName: string,
  sourceType: "pdf" | "docx",
): Promise<ExtractionResult> {
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (err: any) {
    return {
      text: "",
      sourceType,
      error: `Failed to read file: ${err.message}`,
    };
  }

  if (!supabase) {
    return { text: "", sourceType, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "extract-pdf-text",
      {
        body: { file: base64, fileName, fileType: sourceType },
      },
    );

    if (error) {
      return {
        text: "",
        sourceType,
        error: error.message || `Edge function error: ${error}`,
      };
    }

    return {
      text: data?.text || data?.content || "",
      sourceType,
      pageCount: data?.pageCount,
    };
  } catch (err: any) {
    return {
      text: "",
      sourceType,
      error: err.message || "Text extraction network request failed",
    };
  }
}

export async function extractTextFromImage(
  imageUri: string,
): Promise<ExtractionResult> {
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (err: any) {
    return {
      text: "",
      sourceType: "image",
      error: `Failed to read image: ${err.message}`,
    };
  }

  if (!supabase) {
    return { text: "", sourceType: "image", error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "extract-pdf-text-ocr",
      {
        body: { image: base64 },
      },
    );

    if (error) {
      return {
        text: "",
        sourceType: "image",
        error: error.message || `Edge function error: ${error}`,
      };
    }

    return {
      text: data?.text || data?.content || "",
      sourceType: "image",
    };
  } catch (err: any) {
    return {
      text: "",
      sourceType: "image",
      error: err.message || "OCR network request failed",
    };
  }
}

export async function addToOfflineQueue(
  item: Omit<OfflineQueueItem, "id">,
): Promise<void> {
  const queue = await getOfflineQueue();
  const newItem: OfflineQueueItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
  };
  queue.push(newItem);
  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(queue));
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const content = await FileSystem.readAsStringAsync(QUEUE_FILE);
    return JSON.parse(content) as OfflineQueueItem[];
  } catch {
    return [];
  }
}

export async function processOfflineQueue(): Promise<void> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return;

  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      let result: ExtractionResult;
      if (item.sourceType === "image") {
        result = await extractTextFromImage(item.fileUri);
      } else {
        result = await extractTextFromFile(
          item.fileUri,
          item.fileName,
          item.sourceType,
        );
      }

      if (result.text && supabase) {
        await supabase
          .from("notes")
          .update({ content: result.text })
          .eq("id", item.noteId);
      } else if (result.error) {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(remaining));
}
