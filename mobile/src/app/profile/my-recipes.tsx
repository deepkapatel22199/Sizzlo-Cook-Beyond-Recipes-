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
import * as SecureStore from "expo-secure-store";
import { getMyProfile, ProfileRecipe } from "@/api/profileApi";

const RECIPE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<ProfileRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const profile = await getMyProfile(token);
      setRecipes(profile.recipes ?? []);
    } catch (error) {
      console.log("My recipes error:", error);
      Alert.alert("Error", "Unable to load your recipes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRecipes();
    }, [loadRecipes])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={25} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Recipes</Text>

        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {recipes.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="restaurant-outline" size={38} color="#075B34" />
              </View>
              <Text style={styles.emptyTitle}>You haven't published any recipes yet.</Text>
            </View>
          ) : (
            recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/community/post/${recipe.id}` as any)}
              >
                <Image
                  source={{ uri: recipe.image || RECIPE_FALLBACK_IMAGE }}
                  style={styles.recipeImage}
                />

                <View style={styles.recipeInfo}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{recipe.diet || "Recipe"}</Text>
                  </View>

                  <Text style={styles.recipeTitle}>{recipe.title}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color="#777" />
                      <Text style={styles.metaText}>{recipe.cook_time || "25 mins"}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="flame-outline" size={16} color="#777" />
                      <Text style={styles.metaText}>{recipe.difficulty || "Easy"}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 30 }} />
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  recipeCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  recipeImage: {
    width: "100%",
    height: 190,
  },

  recipeInfo: {
    padding: 16,
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
  },

  tagText: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "800",
  },

  recipeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    gap: 18,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },

  emptyState: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#EEF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
});
