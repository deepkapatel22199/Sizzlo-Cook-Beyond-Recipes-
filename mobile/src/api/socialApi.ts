import { API_URL } from "@/services/api";

export type Creator = {
  id: number;
  name: string;
  avatar_url: string | null;
};

export type SocialRecipe = {
  id: number;
  title: string;
  description?: string | null;
  image: string | null;
  diet: string | null;
  cook_time: string | null;
  difficulty: string | null;
  servings?: string | null;
  creator: Creator;
  creator_id: number;
  creator_name: string;
  creator_avatar_url?: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
};

export type SocialState = {
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
};

export type RecipeComment = {
  id: number;
  text: string;
  created_at: string;
  user_id: number;
  user: Creator;
};

async function parseResponse(response: Response, fallbackMessage: string) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || fallbackMessage);
  }

  return data;
}

function normalizeCreator(rawCreator: any, recipe: any): Creator {
  if (rawCreator && typeof rawCreator === "object") {
    return {
      id: Number(rawCreator.id ?? recipe.creator_id ?? 0),
      name: String(rawCreator.name ?? recipe.creator_name ?? "Creator"),
      avatar_url: rawCreator.avatar_url ?? recipe.creator_avatar_url ?? null,
    };
  }

  return {
    id: Number(recipe.creator_id ?? 0),
    name: String(rawCreator ?? recipe.creator_name ?? "Creator"),
    avatar_url: recipe.creator_avatar_url ?? null,
  };
}

export function normalizeSocialRecipe(recipe: any): SocialRecipe {
  const creator = normalizeCreator(recipe.creator, recipe);

  return {
    ...recipe,
    creator,
    creator_id: Number(recipe.creator_id ?? creator.id),
    creator_name: creator.name,
    creator_avatar_url: creator.avatar_url,
    likes_count: Number(recipe.likes_count ?? 0),
    comments_count: Number(recipe.comments_count ?? 0),
    is_liked: Boolean(recipe.is_liked),
    is_saved: Boolean(recipe.is_saved),
  };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getCommunityRecipes(token?: string | null): Promise<SocialRecipe[]> {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/recipes`, { headers });
  const data = await parseResponse(response, "Unable to load recipes");
  return Array.isArray(data) ? data.map(normalizeSocialRecipe) : [];
}

export async function likeRecipe(token: string, recipeId: number): Promise<SocialState> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/like`, {
    method: "POST",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to like recipe");
}

export async function unlikeRecipe(token: string, recipeId: number): Promise<SocialState> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/like`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to unlike recipe");
}

export async function saveRecipe(token: string, recipeId: number): Promise<SocialState> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/save`, {
    method: "POST",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to save recipe");
}

export async function unsaveRecipe(token: string, recipeId: number): Promise<SocialState> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/save`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to remove saved recipe");
}

export async function getSavedRecipes(token: string): Promise<SocialRecipe[]> {
  const response = await fetch(`${API_URL}/users/me/saved-recipes`, {
    headers: authHeaders(token),
  });

  const data = await parseResponse(response, "Unable to load saved recipes");
  return Array.isArray(data) ? data.map(normalizeSocialRecipe) : [];
}

export async function followUser(token: string, userId: number) {
  const response = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: "POST",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to follow user");
}

export async function unfollowUser(token: string, userId: number) {
  const response = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to unfollow user");
}

export async function getRecipeComments(recipeId: number): Promise<RecipeComment[]> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/comments`);
  return parseResponse(response, "Unable to load comments");
}

export async function addRecipeComment(
  token: string,
  recipeId: number,
  text: string
): Promise<RecipeComment> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/comments`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  return parseResponse(response, "Unable to add comment");
}

export async function deleteRecipeComment(token: string, commentId: number) {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to delete comment");
}
