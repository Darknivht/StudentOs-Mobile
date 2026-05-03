import { supabase } from "../supabase/client";
import * as FileSystem from "expo-file-system/legacy";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

export async function uploadFileToStorage(
  file: { uri: string; name: string; type: string },
  userId: string,
): Promise<{ url: string; path: string }> {
  if (!supabase) throw new Error("Supabase not configured");

  if (!file.uri.startsWith("file://") && !file.uri.startsWith("content://")) {
    throw new Error("Invalid file URI format");
  }

  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  if (bytes.byteLength > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  const sanitized = sanitizeFileName(file.name);
  const storagePath = `${userId}/${Date.now()}_${sanitized}`;

  const { error: uploadError } = await supabase.storage
    .from("notes-uploads")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("notes-uploads").getPublicUrl(storagePath);

  return { url: publicUrl, path: storagePath };
}
