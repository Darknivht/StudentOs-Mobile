import { supabase } from "../supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

export async function uploadFileToStorage(
  file: { uri: string; name: string; type: string },
  userId: string,
): Promise<{ url: string; path: string }> {
  if (!supabase) throw new Error("Supabase not configured");

  const response = await fetch(file.uri);
  const blob = await response.blob();

  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  const sanitized = sanitizeFileName(file.name);
  const storagePath = `${userId}/${Date.now()}_${sanitized}`;

  const { error: uploadError } = await supabase.storage
    .from("notes-uploads")
    .upload(storagePath, blob, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("notes-uploads").getPublicUrl(storagePath);

  return { url: publicUrl, path: storagePath };
}
