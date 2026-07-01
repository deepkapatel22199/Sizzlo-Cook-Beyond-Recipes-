import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/services/api";

type AvatarUploadResponse = {
  message: string;
  avatar_url: string;
};

function createImageUploadFormData(uri: string, fileName: string, fileType: string) {
  const formData = new FormData();

  formData.append("file", {
    uri,
    name: fileName,
    type: fileType,
  } as any);

  return formData;
}

export async function pickAndUploadAvatar(token: string): Promise<AvatarUploadResponse | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permission is required to access photos");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const image = result.assets[0];
  const fileName = image.fileName || "avatar.jpg";
  const fileType = image.mimeType || "image/jpeg";
  const formData = createImageUploadFormData(image.uri, fileName, fileType);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Avatar upload failed");
  }

  return data;
}

export function getAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) {
    return null;
  }

  const trimmedAvatarUrl = avatarUrl.trim();

  if (!trimmedAvatarUrl) {
    return null;
  }

  if (trimmedAvatarUrl.startsWith("http")) {
    return trimmedAvatarUrl;
  }

  return `${API_URL}${trimmedAvatarUrl}`;
}
