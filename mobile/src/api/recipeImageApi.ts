import { API_URL } from "@/services/api";
import { File } from "expo-file-system";

type RecipeImageUploadResponse = {
  message: string;
  image_url: string;
};

async function parseUploadResponse(response: Response) {
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    throw new Error(data.detail || data.error || "Recipe image upload failed");
  }

  return data as RecipeImageUploadResponse;
}

function getFileNameFromUri(uri: string) {
  const cleanUri = uri.split("?")[0];
  const fileName = cleanUri.split("/").pop();
  return fileName && fileName.includes(".") ? fileName : "recipe.jpg";
}

function getMimeTypeFromFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

export function getRecipeImageUrl(imageUrl?: string | null) {
  const trimmedImageUrl = imageUrl?.trim();

  if (!trimmedImageUrl) {
    return null;
  }

  if (trimmedImageUrl.startsWith("file:") || trimmedImageUrl.startsWith("content:")) {
    return null;
  }

  if (trimmedImageUrl.startsWith("http")) {
    return trimmedImageUrl;
  }

  if (trimmedImageUrl.startsWith("/uploads")) {
    return `${API_URL}${trimmedImageUrl}`;
  }

  return `${API_URL}/${trimmedImageUrl.replace(/^\/+/, "")}`;
}

export async function uploadRecipeImage(
  token: string,
  imageUri: string
): Promise<RecipeImageUploadResponse> {
  const trimmedImageUri = imageUri.trim();

  if (!trimmedImageUri) {
    throw new Error("Recipe image is missing");
  }

  const fileName = getFileNameFromUri(trimmedImageUri);
  const file = new File(trimmedImageUri);
  const formData = new FormData();
  formData.append("file", file as any, fileName);

  const response = await fetch(`${API_URL}/recipes/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || "Recipe image upload failed");
  }

  return data as RecipeImageUploadResponse;
}

export async function updateRecipeImage(
  token: string,
  recipeId: number,
  imageUri: string
): Promise<RecipeImageUploadResponse> {
  const trimmedImageUri = imageUri.trim();

  if (!trimmedImageUri) {
    throw new Error("Recipe image is missing");
  }

  const fileName = getFileNameFromUri(trimmedImageUri);
  const file = new File(trimmedImageUri);
  const formData = new FormData();
  formData.append("file", file as any, fileName);

  const response = await fetch(`${API_URL}/recipes/${recipeId}/image`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || "Recipe image upload failed");
  }

  return data as RecipeImageUploadResponse;
}
