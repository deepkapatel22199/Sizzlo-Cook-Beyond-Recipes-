import React, { createContext, useContext, useState } from "react";

type Ingredient = {
  id: string;
  name: string;
  quantity: string;
};

type RecipeStep = {
  id: string;
  instruction: string;
};

type RecipeData = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prepTime: string;
  servings: string;
  cookTime: string;
  coverImage: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  photos: string[];
};

type RecipeContextType = {
  recipe: RecipeData;
  updateRecipe: (data: Partial<RecipeData>) => void;
  resetRecipe: () => void;
};

const initialRecipe: RecipeData = {
  title: "",
  description: "",
  category: "",
  difficulty: "",
  cookTime: "",
  prepTime: "",
  servings: "",
  ingredients: [],
  steps: [],
  coverImage: null,
  photos: [],
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipe, setRecipe] = useState<RecipeData>(initialRecipe);

  const updateRecipe = (data: Partial<RecipeData>) => {
    setRecipe((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const resetRecipe = () => {
    setRecipe(initialRecipe);
  };

  return (
    <RecipeContext.Provider value={{ recipe, updateRecipe, resetRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);

  if (!context) {
    throw new Error("useRecipe must be used inside RecipeProvider");
  }

  return context;
}
