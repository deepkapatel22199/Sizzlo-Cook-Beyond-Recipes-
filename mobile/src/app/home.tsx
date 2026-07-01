import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  getCommunityRecipes,
  getLatestRecipes,
  saveRecipe,
  SocialRecipe,
  unsaveRecipe,
} from "@/api/socialApi";
import { getRecipeImageUrl } from "@/api/recipeImageApi";
import { HOME_RECIPE_CATEGORIES, RECIPE_CATEGORY_ICONS } from "@/constants/recipeCategories";

type CategoryState = string | null;

export default function Home() {
  const [allRecipes, setAllRecipes] = useState<SocialRecipe[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<SocialRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryState>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const communityRecipes = await getCommunityRecipes(token);
      setAllRecipes(communityRecipes);

      try {
        const latest = await getLatestRecipes(5);
        setRecommendedRecipes(latest);
      } catch {
        setRecommendedRecipes(communityRecipes.slice(0, 5));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load recipes.");
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

  const handleToggleSave = async (recipe: SocialRecipe) => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const toggleLocalSave = (recipesList: SocialRecipe[]) =>
      recipesList.map((currentRecipe) =>
        currentRecipe.id === recipe.id
          ? { ...currentRecipe, is_saved: !currentRecipe.is_saved }
          : currentRecipe
      );

    setAllRecipes(toggleLocalSave);
    setRecommendedRecipes(toggleLocalSave);

    try {
      const updated = recipe.is_saved
        ? await unsaveRecipe(token, recipe.id)
        : await saveRecipe(token, recipe.id);

      const applyServerSaveState = (recipesList: SocialRecipe[]) =>
        recipesList.map((currentRecipe) =>
          currentRecipe.id === recipe.id
            ? { ...currentRecipe, is_saved: updated.is_saved }
            : currentRecipe
        );

      setAllRecipes(applyServerSaveState);
      setRecommendedRecipes(applyServerSaveState);
    } catch (error: any) {
      const restoreSaveState = (recipesList: SocialRecipe[]) =>
        recipesList.map((currentRecipe) =>
          currentRecipe.id === recipe.id
            ? { ...currentRecipe, is_saved: recipe.is_saved }
            : currentRecipe
        );

      setAllRecipes(restoreSaveState);
      setRecommendedRecipes(restoreSaveState);
      Alert.alert("Error", error.message || "Unable to update saved recipe.");
    }
  };

  const categoryRecipes = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return allRecipes.filter((recipe) => {
      const recipeCategory = (recipe.category || recipe.diet || "Other").trim().toLowerCase();
      return recipeCategory === selectedCategory.toLowerCase();
    });
  }, [allRecipes, selectedCategory]);

  const activeFeedRecipes = selectedCategory ? categoryRecipes : recommendedRecipes;
  const feedTitle = selectedCategory ? `${selectedCategory} Recipes` : "Recommended For You";
  const isCategoryFeedEmpty = Boolean(selectedCategory) && !categoryRecipes.length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="restaurant-outline" size={30} color="#075B34" />
            <Text style={styles.logo}>
              Sizz<Text style={styles.orange}>lo</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.bell}>
            <Ionicons name="notifications-outline" size={28} color="#075B34" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>Hi Chef!</Text>
        <Text style={styles.subGreeting}>What are we cooking today?</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={22} color="#6B7280" />
          <TextInput
            placeholder="Search recipes, ingredients..."
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
          />
          <Ionicons name="options-outline" size={22} color="#6B7280" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.aiBadge}>AI RECOMMENDATION</Text>
            <Text style={styles.heroTitle}>Grilled Chicken{"\n"}Power Bowl</Text>
            <Text style={styles.heroSub}>High protein, low carb,{"\n"}ready in 25 mins</Text>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Recipe</Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={48} color="#075B34" />
          </View>
        </View>

        <SectionHeader
          title="Categories"
          onPress={() => router.push("/categories" as any)}
          actionLabel="View all"
        />

        <View style={styles.categories}>
          {HOME_RECIPE_CATEGORIES.map((label) => (
            <Category
              key={label}
              icon={RECIPE_CATEGORY_ICONS[label]}
              label={label}
              active={selectedCategory === label}
              onPress={() => setSelectedCategory((current) => (current === label ? null : label))}
            />
          ))}
        </View>

        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>{feedTitle}</Text>

          <View style={styles.feedHeaderActions}>
            {selectedCategory ? (
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push({ pathname: "/community", params: { source: "recommended" } })}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#006B3C" style={{ marginVertical: 18 }} />
        ) : !selectedCategory && !activeFeedRecipes.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No recipes yet. Follow creators or check Community.</Text>
          </View>
        ) : isCategoryFeedEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No recipes available for {selectedCategory} yet.
            </Text>
            <Text style={styles.emptyStateSub}>Try another category or explore Community.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipeRow}
          >
            {activeFeedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleSave={handleToggleSave}
                compact
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.askCard}>
          <View style={styles.askIconBox}>
            <Ionicons name="restaurant-outline" size={36} color="#075B34" />
          </View>

          <View style={styles.askTextWrap}>
            <Text style={styles.askTitle}>Ask AI Chef</Text>
            <Text style={styles.askSub}>Get recipe ideas, cooking tips{"\n"}and more with AI</Text>
          </View>

          <TouchableOpacity style={styles.askButton}>
            <Text style={styles.askButtonText}>Ask Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 95 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/create-recipe")}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" active />
        <NavItem icon="heart-outline" label="Saved" onPress={() => router.push("/saved-recipes" as any)} />
        <NavItem icon="restaurant-outline" label="AI Chef" />
        <NavItem icon="people-outline" label="Community" onPress={() => router.push("/community" as any)} />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.push("/profile" as any)} />
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  onPress,
  actionLabel = "View all",
}: {
  title: string;
  onPress?: () => void;
  actionLabel?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewAll}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function Category({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.categoryBox, active && styles.categoryBoxActive]}>
        <MaterialCommunityIcons name={icon} size={28} color={active ? "#fff" : "#075B34"} />
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RecipeCard({
  recipe,
  onToggleSave,
  compact = false,
}: {
  recipe: SocialRecipe;
  onToggleSave: (recipe: SocialRecipe) => void;
  compact?: boolean;
}) {
  const imageUrl = getRecipeImageUrl(recipe.image);
  const categoryLabel = recipe.category || recipe.diet || "Other";

  return (
    <View style={[styles.recipeCard, compact && styles.recipeCardCompact]}>
      <TouchableOpacity onPress={() => router.push(`/community/post/${recipe.id}` as any)}>
        {imageUrl ? (
          <View style={[styles.recipeImageWrap, compact && styles.recipeImageWrapCompact]}>
            <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
          </View>
        ) : (
          <View style={[styles.recipeImagePlaceholder, compact && styles.recipeImagePlaceholderCompact]}>
            <Ionicons name="restaurant-outline" size={32} color="#B8B8B8" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.heart} onPress={() => onToggleSave(recipe)}>
        <Ionicons
          name={recipe.is_saved ? "bookmark" : "bookmark-outline"}
          size={20}
          color={recipe.is_saved ? "#F97316" : "#6B7280"}
        />
      </TouchableOpacity>

      <View style={styles.tagPill}>
        <Text style={styles.tagText}>{categoryLabel}</Text>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.recipeMeta}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.metaText}>{recipe.cook_time || "25 mins"}</Text>
        </View>

        <View style={styles.recipeMeta}>
          <FontAwesome name="star" size={12} color="#F59E0B" />
          <Text style={styles.metaText}>
            {recipe.likes_count} likes • {recipe.difficulty || "Easy"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={23} color={active ? "#075B34" : "#6B7280"} />

      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>

      {active && <View style={styles.activeLine} />}
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
    paddingTop: 8,
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#075B34",
    marginLeft: 7,
  },
  orange: {
    color: "#F46B08",
  },
  bell: {
    position: "relative",
  },
  dot: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  greeting: {
    fontSize: 27,
    fontWeight: "800",
    color: "#075B34",
    marginTop: 28,
  },
  subGreeting: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
    marginTop: 3,
    marginBottom: 18,
  },
  searchBox: {
    height: 50,
    borderRadius: 17,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14.5,
    fontWeight: "500",
  },
  heroCard: {
    height: 200,
    borderRadius: 20,
    backgroundColor: "#EEF7EE",
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 22,
  },
  heroContent: {
    flex: 1.1,
    padding: 15,
  },
  aiBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#075B34",
    marginBottom: 9,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    color: "#075B34",
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
    marginTop: 6,
    marginBottom: 11,
  },
  viewButton: {
    width: 120,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#006B3C",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "800",
  },
  heroImagePlaceholder: {
    flex: 0.9,
    backgroundColor: "#E2F1E4",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#075B34",
  },
  viewAll: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#075B34",
    marginTop: 3,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: "center",
    flex: 1,
  },
  categoryBox: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: "#EEF7EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryBoxActive: {
    backgroundColor: "#075B34",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  categoryLabelActive: {
    color: "#075B34",
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#075B34",
  },
  recipeRow: {
    gap: 12,
    paddingBottom: 22,
    paddingRight: 20,
  },
  recipeCardCompact: {
    width: 170,
  },
  recipeImageWrapCompact: {
    height: 96,
  },
  recipeImagePlaceholderCompact: {
    height: 96,
  },
  recipeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  recipeCard: {
    width: "31.5%",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recipeImageWrap: {
    width: "100%",
    height: 82,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 82,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },
  heart: {
    position: "absolute",
    top: 7,
    right: 7,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    padding: 3,
  },
  tagPill: {
    position: "absolute",
    left: 7,
    top: 7,
    backgroundColor: "rgba(255,243,232,0.95)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    maxWidth: "72%",
  },
  tagText: {
    fontSize: 9.5,
    color: "#F97316",
    fontWeight: "800",
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 12.3,
    fontWeight: "800",
    color: "#111",
    lineHeight: 16,
    marginBottom: 7,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 10.5,
    color: "#4B5563",
    fontWeight: "600",
  },
  askCard: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#EEF7EE",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
  },
  askIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  askTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  askTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#075B34",
  },
  askSub: {
    fontSize: 12.3,
    lineHeight: 17,
    color: "#4B5563",
    marginTop: 2,
  },
  askButton: {
    width: 94,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
  },
  askButtonText: {
    fontSize: 12.5,
    color: "#fff",
    fontWeight: "800",
  },
  emptyState: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 22,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    lineHeight: 22,
  },
  emptyStateSub: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    elevation: 8,
  },
  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    fontSize: 10.5,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#075B34",
    fontWeight: "800",
  },
  activeLine: {
    width: 24,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#075B34",
    marginTop: 4,
  },
});
