import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { uploadFileToStorage } from "../services/notes/fileUploader";
import {
  extractTextFromFile,
  extractTextFromImage,
} from "../services/notes/textExtractor";
import { useAuthStore } from "../stores/authStore";
import type { SourceType } from "../types/note";

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  extractedText: string | null;
  sourceType: SourceType | null;
  fileUrl: string | null;
  originalFilename: string | null;
}

const INITIAL_STATE: FileUploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  extractedText: null,
  sourceType: null,
  fileUrl: null,
  originalFilename: null,
};

export function useFileUpload() {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<FileUploadState>(INITIAL_STATE);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setState((s) => ({ ...s, error: "Camera permission denied" }));
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: `ocr_${Date.now()}.jpg`,
      type: "image/jpeg",
    };
  }, []);

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setState((s) => ({ ...s, error: "Gallery permission denied" }));
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: `gallery_${Date.now()}.jpg`,
      type: "image/jpeg",
    };
  }, []);

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    const isPdf =
      asset.mimeType === "application/pdf" ||
      asset.name.toLowerCase().endsWith(".pdf");
    const sourceType: SourceType = isPdf ? "pdf" : "docx";

    return {
      uri: asset.uri,
      name: asset.name,
      type:
        asset.mimeType ||
        (isPdf
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      sourceType,
    };
  }, []);

  const uploadAndExtract = useCallback(
    async (
      file: { uri: string; name: string; type: string },
      sourceType: "pdf" | "docx" | "image",
    ) => {
      if (!user) {
        setState((s) => ({ ...s, error: "Not authenticated" }));
        return;
      }

      setState({
        isUploading: true,
        progress: 10,
        error: null,
        extractedText: null,
        sourceType,
        fileUrl: null,
        originalFilename: file.name,
      });

      try {
        setState((s) => ({ ...s, progress: 30 }));

        const { url, path } = await uploadFileToStorage(file, user.id);

        setState((s) => ({ ...s, progress: 60, fileUrl: url }));

        let extractedText = "";

        if (sourceType === "image") {
          const result = await extractTextFromImage(file.uri);
          extractedText = result.text;
        } else {
          const result = await extractTextFromFile(
            file.uri,
            file.name,
            sourceType,
          );
          extractedText = result.text;
        }

        setState((s) => ({
          ...s,
          isUploading: false,
          progress: 100,
          extractedText,
        }));
      } catch (err: any) {
        setState((s) => ({
          ...s,
          isUploading: false,
          error: err.message || "Upload failed",
        }));
      }
    },
    [user],
  );

  const handleCameraOCR = useCallback(async () => {
    const file = await pickImage();
    if (!file) return;
    await uploadAndExtract(file, "image");
  }, [pickImage, uploadAndExtract]);

  const handleGalleryOCR = useCallback(async () => {
    const file = await pickFromGallery();
    if (!file) return;
    await uploadAndExtract(file, "image");
  }, [pickFromGallery, uploadAndExtract]);

  const handleDocumentUpload = useCallback(async () => {
    const result = await pickDocument();
    if (!result) return;
    const { sourceType, ...file } = result;
    await uploadAndExtract(file, sourceType);
  }, [pickDocument, uploadAndExtract]);

  return {
    ...state,
    reset,
    handleCameraOCR,
    handleGalleryOCR,
    handleDocumentUpload,
  };
}
