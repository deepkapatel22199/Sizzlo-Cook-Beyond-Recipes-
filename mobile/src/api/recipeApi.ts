import { API_URL } from "@/services/api";
import { Creator, normalizeSocialRecipe } from "@/api/socialApi";

export type RecipePayload = {
  title?: string;
  description?: string;
  image?: string | null;
  photos?: string[];
  category?: string;
  cook_time?: string;
  difficulty?: string;
  servings?: string;
  diet?: string;
  ingredients?: string[];
  steps?: string[];
};

export type RecipeDetail = {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  photos: string[];
  category: string;
  cook_time: string | null;
  difficulty: string | null;
  servings: string | null;
  diet: string | null;
  created_at?: string;
  creator: Creator;
  creator_name?: string;
  creator_id: number;
  creator_avatar_url: string | null;
  ingredients: string[];
  steps: string[];
  is_owner?: boolean;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
};

async function parseRecipeResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Recipe request failed");
  }

  return data;
}

export async function getRecipeById(
  recipeId: number | string,
  token?: string | null
): Promise<RecipeDetail> {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
    headers,
  });

  const data = await parseRecipeResponse(response);
  const normalizedRecipe = normalizeSocialRecipe(data);

  return {
    ...data,
    ...normalizedRecipe,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    steps: Array.isArray(data.steps) ? data.steps : [],
    is_owner: Boolean(data.is_owner),
  };
}

export async function updateRecipe(
  token: string,
  recipeId: number | string,
  payload: RecipePayload
): Promise<RecipeDetail> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseRecipeResponse(response);
  const normalizedRecipe = normalizeSocialRecipe(data);

  return {
    ...data,
    ...normalizedRecipe,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    steps: Array.isArray(data.steps) ? data.steps : [],
    is_owner: Boolean(data.is_owner),
  };
}

export async function deleteRecipe(
  token: string,
  recipeId: number | string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseRecipeResponse(response);
}
