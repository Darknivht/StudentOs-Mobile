import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload, X } from "lucide-react-native";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  disabled,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        if (asset.base64) {
          onImageSelect(asset.base64);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        if (asset.base64) {
          onImageSelect(asset.base64);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <View className="relative rounded-xl overflow-hidden border border-border">
        <Image
          source={{ uri: preview }}
          className="w-full h-48"
          resizeMode="contain"
        />
        <Pressable
          onPress={clearImage}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive items-center justify-center"
        >
          <X size={16} className="text-white" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <Pressable
          onPress={takePhoto}
          disabled={disabled || loading}
          className="flex-1 p-4 rounded-xl border-2 border-dashed border-border items-center gap-2"
        >
          {loading ? (
            <ActivityIndicator size="small" className="text-primary" />
          ) : (
            <>
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                <Camera size={24} className="text-primary" />
              </View>
              <Text className="font-medium text-foreground text-sm">
                Take Photo
              </Text>
            </>
          )}
        </Pressable>
        <Pressable
          onPress={pickImage}
          disabled={disabled || loading}
          className="flex-1 p-4 rounded-xl border-2 border-dashed border-border items-center gap-2"
        >
          {loading ? (
            <ActivityIndicator size="small" className="text-primary" />
          ) : (
            <>
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                <Upload size={24} className="text-primary" />
              </View>
              <Text className="font-medium text-foreground text-sm">
                Upload Image
              </Text>
            </>
          )}
        </Pressable>
      </View>
      <Text className="text-xs text-muted-foreground text-center">
        Supports JPG, PNG, HEIC
      </Text>
    </View>
  );
}
