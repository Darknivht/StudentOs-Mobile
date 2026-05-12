import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export function useMediaUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets.length) return null;

    setUploading(true);

    try {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop() || "jpg";
      const filename = `${user.id}/${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("chat-media")
        .upload(filename, blob, {
          contentType: `image/${ext}`,
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(data.path);

      return publicUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  }, [user]);

  return { pickAndUpload, uploading };
}