import { useState, useCallback } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { cn } from "@studentos/shared";
import { supabase } from "../../services/supabase";
import Toast from "react-native-toast-message";

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  fallback: string;
  onUploaded: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 40, md: 64, lg: 96 };

export function AvatarUpload({
  userId,
  currentUrl,
  fallback,
  onUploaded,
  size = "lg",
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUrl);
  const px = sizeMap[size];
  const fontSize = px * 0.4;

  const handleUpload = useCallback(async () => {
    if (uploading) return;

    Alert.alert("Change Avatar", "Choose a photo source", [
      { text: "Camera", onPress: pickFromCamera },
      { text: "Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [uploading]);

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled || !result.assets?.[0]) return;
      await uploadImage(result.assets[0].uri);
    } catch {
      Toast.show({ type: "error", text1: "Failed to pick image" });
    }
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: "error", text1: "Camera permission required" });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled || !result.assets?.[0]) return;
      await uploadImage(result.assets[0].uri);
    } catch {
      Toast.show({ type: "error", text1: "Failed to take photo" });
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar.${ext}`;

      const formData = new FormData();
      const filename = `avatar.${ext}`;
      formData.append("file", {
        uri,
        type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        name: filename,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, formData, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const url = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", userId);

      setAvatarUrl(url);
      onUploaded(url);
      Toast.show({ type: "success", text1: "Avatar updated!" });
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({ type: "error", text1: "Failed to upload avatar" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Pressable onPress={handleUpload} disabled={uploading}>
      <View
        className="rounded-full items-center justify-center overflow-hidden border-2 border-primary/30"
        style={{ width: px, height: px }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: px, height: px }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-primary/10 w-full h-full">
            <Text
              className="text-primary-foreground font-bold"
              style={{ fontSize }}
            >
              {fallback}
            </Text>
          </View>
        )}
      </View>
      <View
        className="absolute rounded-full items-center justify-center bg-black/40"
        style={{ width: px, height: px }}
      >
        {uploading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Camera className="w-5 h-5 text-white" />
        )}
      </View>
    </Pressable>
  );
}
