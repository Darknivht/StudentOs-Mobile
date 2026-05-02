import { supabase } from "../supabase/client";
import * as FileSystem from "expo-file-system/legacy";

interface ExtractionResult {
  text: string;
  sourceType: string;
  pageCount?: number;
}

interface OfflineQueueItem {
  id: string;
  noteId: string;
  fileUri: string;
  fileName: string;
  sourceType: "pdf" | "docx" | "image";
}

const OFFLINE_QUEUE_KEY = "offline_extraction_queue";

export async function extractTextFromFile(
  fileUri: string,
  fileName: string,
  sourceType: "pdf" | "docx",
): Promise<ExtractionResult> {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!supabase) return { text: "", sourceType };

    const { data, error } = await supabase.functions.invoke(
      "extract-pdf-text",
      {
        body: { file: base64, fileName, fileType: sourceType },
      },
    );

    if (error) {
      console.error("Text extraction error:", error);
      return { text: "", sourceType };
    }

    return {
      text: data?.text || data?.content || "",
      sourceType,
      pageCount: data?.pageCount,
    };
  } catch (err) {
    console.error("extractTextFromFile failed:", err);
    return { text: "", sourceType };
  }
}

export async function extractTextFromImage(
  imageUri: string,
): Promise<ExtractionResult> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!supabase) return { text: "", sourceType: "image" };

    const { data, error } = await supabase.functions.invoke(
      "extract-pdf-text-ocr",
      {
        body: { image: base64 },
      },
    );

    if (error) {
      console.error("OCR extraction error:", error);
      return { text: "", sourceType: "image" };
    }

    return {
      text: data?.text || data?.content || "",
      sourceType: "image",
    };
  } catch (err) {
    console.error("extractTextFromImage failed:", err);
    return { text: "", sourceType: "image" };
  }
}

export function addToOfflineQueue(item: Omit<OfflineQueueItem, "id">): void {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
  };
  queue.push(newItem);
  try {
    const json = JSON.stringify(queue);
    FileSystem.writeAsStringAsync(
      (FileSystem.documentDirectory || "") + OFFLINE_QUEUE_KEY,
      json,
    ).catch(() => {});
  } catch {}
}

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    return [];
  } catch {
    return [];
  }
}

export async function processOfflineQueue(): Promise<void> {
  const queue = getOfflineQueue();
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
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  try {
    await FileSystem.writeAsStringAsync(
      (FileSystem.documentDirectory || "") + OFFLINE_QUEUE_KEY,
      JSON.stringify(remaining),
    );
  } catch {}
}
