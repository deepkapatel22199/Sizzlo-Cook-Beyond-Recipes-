import { API_URL } from "@/services/api";

export type ProfileRecipe = {
  id: number;
  title: string;
  image: string | null;
  diet: string | null;
  cook_time: string | null;
  difficulty: string | null;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  avatar?: string | null;
  recipes_count: number;
  saved_count: number;
  recipes: ProfileRecipe[];
};

export type UpdateProfilePayload = {
  name: string;
  username: string;
  bio: string;
};

export async function getMyProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to load profile");
  }

  return data;
}

export async function updateMyProfile(
  token: string,
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/me/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to update profile");
  }

  return data;
}
