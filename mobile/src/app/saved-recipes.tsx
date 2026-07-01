import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRecipeImageUrl } from "@/api/recipeImageApi";
import { getSavedRecipes, SocialRecipe } from "@/api/socialApi";
import * as SecureStore from "expo-secure-store";

export default function SavedRecipesScreen() {
  const [recipes, setRecipes] = useState<SocialRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedRecipes = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      setRecipes(await getSavedRecipes(token));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load saved recipes.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={42} color="#F97316" />
          <Text style={styles.emptyTitle}>No saved recipes yet</Text>
          <Text style={styles.emptyText}>Save recipes from the community and they will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {recipes.map((recipe) => {
            const imageUri = getRecipeImageUrl(recipe.image);

            return (
              <TouchableOpacity
                key={recipe.id}
                style={styles.gridItem}
                onPress={() => router.push(`/community/post/${recipe.id}` as any)}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.gridImage} />
                ) : (
                  <View style={styles.gridPlaceholder}>
                    <Ionicons name="restaurant-outline" size={30} color="#F97316" />
                  </View>
                )}

                <View style={styles.overlay}>
                  <Text style={styles.gridTitle} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPlaceholder: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  gridItem: {
    width: "32.6%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  gridTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginTop: 14,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
});
