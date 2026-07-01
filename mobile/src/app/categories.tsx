import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCommunityRecipes, getRecipeCategories, SocialRecipe } from "@/api/socialApi";
import { getRecipeImageUrl } from "@/api/recipeImageApi";
import {
  FALLBACK_RECIPE_CATEGORIES,
  RECIPE_CATEGORY_ICONS,
} from "@/constants/recipeCategories";

type CategoryState = string | null;

export default function CategoriesScreen() {
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const initialCategory = Array.isArray(category) ? category[0] : category;
  const [recipes, setRecipes] = useState<SocialRecipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryState>(initialCategory || null);

  const fetchRecipes = useCallback(async () => {
    try {
      const [recipeData, categoryData] = await Promise.all([
        getCommunityRecipes(),
        getRecipeCategories().catch(() => FALLBACK_RECIPE_CATEGORIES),
      ]);

      setRecipes(recipeData);
      setCategories(categoryData.length ? [...categoryData] : [...FALLBACK_RECIPE_CATEGORIES]);
    } catch {
      setRecipes([]);
      setCategories([...FALLBACK_RECIPE_CATEGORIES]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRecipes();
    }, [fetchRecipes])
  );

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return recipes.filter((recipe) => {
      const categoryValue = (recipe.category || recipe.diet || "Other").trim().toLowerCase();
      return categoryValue === selectedCategory.toLowerCase();
    });
  }, [recipes, selectedCategory]);

  const isGridView = !selectedCategory;
  const displayedCategories = categories.length ? categories : [...FALLBACK_RECIPE_CATEGORIES];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (selectedCategory) {
                setSelectedCategory(null);
                return;
              }

              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#075B34" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {selectedCategory ? `${selectedCategory} Recipes` : "Categories"}
            </Text>
            <Text style={styles.subtitle}>
              {selectedCategory ? "Browse matching recipes" : "Explore recipes by category"}
            </Text>
          </View>
        </View>

        {isGridView ? (
          <View style={styles.grid}>
            {displayedCategories.map((label) => (
              <CategoryCard
                key={label}
                label={label}
                icon={RECIPE_CATEGORY_ICONS[label] ?? "food"}
                onPress={() => setSelectedCategory(label)}
              />
            ))}
          </View>
        ) : loading ? (
          <ActivityIndicator size="small" color="#006B3C" style={{ marginVertical: 18 }} />
        ) : filteredRecipes.length ? (
          <View style={styles.recipeGrid}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No recipes available for {selectedCategory} yet.</Text>
            <Text style={styles.emptySub}>Try another category or explore Community.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.categoryIcon}>
        <MaterialCommunityIcons name={icon ?? "food"} size={30} color="#075B34" />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RecipeCard({ recipe }: { recipe: SocialRecipe }) {
  const imageUrl = getRecipeImageUrl(recipe.image);
  const categoryLabel = recipe.category || recipe.diet || "Other";

  return (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/community/post/${recipe.id}` as any)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
      ) : (
        <View style={styles.recipeImagePlaceholder}>
          <Ionicons name="restaurant-outline" size={34} color="#B8B8B8" />
        </View>
      )}

      <View style={styles.tagPill}>
        <Text style={styles.tagText}>{categoryLabel}</Text>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.recipeMeta} numberOfLines={1}>
          {recipe.cook_time || "25 mins"} - {recipe.difficulty || "Easy"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#075B34",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#4B5563",
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  categoryCard: {
    width: "31%",
    minHeight: 112,
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: "#EEF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  emptyState: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  recipeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
  },
  recipeCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  recipeImage: {
    width: "100%",
    height: 110,
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 110,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },
  tagPill: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,243,232,0.95)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: "74%",
  },
  tagText: {
    fontSize: 9.5,
    color: "#F97316",
    fontWeight: "800",
  },
  recipeInfo: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 12.8,
    fontWeight: "800",
    color: "#111",
    lineHeight: 16,
    marginBottom: 6,
  },
  recipeMeta: {
    fontSize: 10.5,
    color: "#6B7280",
    fontWeight: "600",
  },
});
