import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/services/api";
import { File } from "expo-file-system";

type AvatarUploadResponse = {
  message: string;
  avatar_url: string;
};

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
  const file = new File(image.uri);
  const formData = new FormData();
  formData.append("file", file as any, fileName);

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

  return data as AvatarUploadResponse;
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
