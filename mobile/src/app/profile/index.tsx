import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { getMyProfile, ProfileRecipe, UserProfile } from "@/api/profileApi";
import Avatar from "@/components/Avatar";
import { getRecipeImageUrl } from "@/api/recipeImageApi";

const GRID_GAP = 4;
const GRID_HORIZONTAL_PADDING = 20;

export default function Profile() {
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const gridItemSize = useMemo(() => {
    return (width - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP * 2) / 3;
  }, [width]);

  const loadProfile = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const data = await getMyProfile(token);
      setProfile(data);
    } catch (error) {
      console.log("Profile load error:", error);
      Alert.alert("Error", "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const renderRecipeTile = (recipe: ProfileRecipe) => {
    const imageUri = getRecipeImageUrl(recipe.image);

    return (
      <TouchableOpacity
        key={recipe.id}
        activeOpacity={0.85}
        style={[styles.gridItem, { width: gridItemSize }]}
        onPress={() => router.push(`/community/post/${recipe.id}` as any)}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.gridImage} />
        ) : (
          <View style={styles.recipePlaceholder}>
            <Ionicons name="restaurant-outline" size={28} color="#F97316" />
          </View>
        )}

        <View style={styles.recipeTitleOverlay}>
          <Text style={styles.recipeTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const recipes = profile.recipes ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/profile/settings" as any)}
          >
            <Ionicons name="settings-outline" size={23} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Avatar avatarUrl={profile.avatar_url} size={104} style={styles.avatar} />

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.recipes_count ?? recipes.length}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.followers_count ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.following_count ?? 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.likes_count ?? 0}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          <View style={styles.activeTab}>
            <Ionicons name="grid-outline" size={20} color="#F97316" />
            <Text style={styles.activeTabText}>Recipes</Text>
          </View>
        </View>

        {recipes.length > 0 ? (
          <View style={styles.grid}>{recipes.map(renderRecipeTile)}</View>
        ) : (
          <View style={styles.emptyRecipeState}>
            <View style={styles.emptyRecipeIcon}>
              <Ionicons name="restaurant-outline" size={34} color="#F97316" />
            </View>
            <Text style={styles.emptyRecipeTitle}>No recipes yet</Text>
            <Text style={styles.emptyRecipeText}>Publish your first recipe and it will appear here.</Text>
            <TouchableOpacity
              style={styles.createRecipeButton}
              onPress={() => router.push("/create-recipe" as any)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.createRecipeButtonText}>Create Recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingBottom: 14,
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

  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  avatar: {
    marginBottom: 13,
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#FFF",
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },

  username: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    fontWeight: "700",
  },

  bio: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 18,
    maxWidth: 320,
  },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
    fontWeight: "700",
  },

  tabRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EFE7DD",
    backgroundColor: "#FAF7F2",
    alignItems: "center",
  },

  activeTab: {
    minHeight: 46,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderBottomWidth: 2,
    borderBottomColor: "#F97316",
  },

  activeTabText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
  },

  grid: {
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingTop: GRID_GAP,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },

  gridItem: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },

  gridImage: {
    width: "100%",
    height: "100%",
  },

  recipePlaceholder: {
    flex: 1,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },

  recipeTitleOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 32,
    paddingHorizontal: 7,
    paddingVertical: 7,
    backgroundColor: "rgba(0,0,0,0.52)",
  },

  recipeTitle: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },

  emptyRecipeState: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: "#FFF",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  emptyRecipeIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyRecipeTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    lineHeight: 24,
  },

  emptyRecipeText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },

  createRecipeButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: "#075B34",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  createRecipeButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
});
