import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native";
import {useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { API_URL } from "../../services/api";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { getMyProfile } from "@/api/profileApi";
import Avatar from "@/components/Avatar";


type RecipePost = {
  id: number;
  title: string;
  description: string;
  image: string;
  cook_time: string;
  difficulty: string;
  servings: string;
  diet: string;
  creator: string;
  creator_id: number;
  creator_avatar_url: string | null;
};

export default function CommunityHomeFeed() {
  const [posts, setPosts] = useState<RecipePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

const fetchRecipes = async () => {
  try {
    const response = await fetch(`${API_URL}/recipes`);
    const data = await response.json();
    setPosts(data);
  } catch (error) {
    console.log("Fetch recipes error:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

const fetchCurrentUserProfile = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) return;

    const profile = await getMyProfile(token);
    setCurrentUserAvatar(profile.avatar_url);
  } catch (error) {
    console.log("Current user profile error:", error);
  }
};

useEffect(() => {
  fetchRecipes();
  fetchCurrentUserProfile();
}, []);

useFocusEffect(
  useCallback(() => {
    fetchCurrentUserProfile();
  }, [])
);

const onRefresh = () => {
  setRefreshing(true);
  fetchRecipes();
  fetchCurrentUserProfile();
};


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
         refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
      >
        {/* Header */}
        <View style={styles.header}>
  <View>
    <Text style={styles.title}>Community</Text>
    <Text style={styles.subtitle}>Discover recipes from cooks</Text>
  </View>

  <View style={styles.headerRight}>
    <TouchableOpacity style={styles.searchButton}>
      <Ionicons name="search-outline" size={22} color="#111" />
    </TouchableOpacity>

   <TouchableOpacity
  style={styles.profileButton}
  onPress={() => router.push("/profile" as any)}
>
      <Avatar avatarUrl={currentUserAvatar} size={46} />
    </TouchableOpacity>
  </View>
</View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {["For You", "Vegetarian", "High Protein", "Vegan", "Quick Meals"].map(
            (item, index) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryChip,
                  index === 0 && styles.activeCategory,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    index === 0 && styles.activeCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
{loading && (
  <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
)}

        {/* Feed */}
        <View style={styles.feed}>
  {posts.map((post) => (
    <View key={post.id} style={styles.card}>
      {/* Creator Row */}
     <TouchableOpacity
  style={styles.creatorRow}
  onPress={() =>
  router.push({
    pathname: "/community/profile/[id]",
    params: {
      id: String(post.creator_id),
    },
  })
}
>
        <Avatar avatarUrl={post.creator_avatar_url} size={46} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <View style={styles.creatorNameRow}>
            <Text style={styles.creatorName}>{post.creator}</Text>
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          </View>

          <Text style={styles.creatorSub}>Shared a new recipe</Text>
        </View>

        <Ionicons name="ellipsis-horizontal" size={22} color="#777" />
      </TouchableOpacity>

      {/* Recipe Image */}
      <TouchableOpacity
        onPress={() => router.push(`/community/post/${post.id}` as any)}
      >
        <Image
          source={{
            uri:
              post.image ||
              "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
          }}
          style={styles.recipeImage}
        />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{post.diet || "Recipe"}</Text>
        </View>

        <Text style={styles.recipeTitle}>{post.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={17} color="#777" />
            <Text style={styles.metaText}>{post.cook_time || "25 mins"}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="heart-outline" size={17} color="#777" />
            <Text style={styles.metaText}>0 likes</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={22} color="#111" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={22} color="#111" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/community/post/${post.id}` as any)}
          >
            <Text style={styles.viewText}>View Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ))}
</View>

        <View style={{ height: 30 }} />
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
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  categoryRow: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 10,
  },

  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFF",
  },

  activeCategory: {
    backgroundColor: "#F97316",
  },

  headerRight: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

profileButton: {
  width: 46,
  height: 46,
  borderRadius: 23,
  overflow: "hidden",
  backgroundColor: "#FFF",
},

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  activeCategoryText: {
    color: "#FFF",
  },

  feed: {
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 26,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  creatorNameRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
},

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  avatar: {
    marginRight: 12,
  },

  creatorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  creatorSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  recipeImage: {
    width: "100%",
    height: 230,
  },

  content: {
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
    fontWeight: "700",
  },

  recipeTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 16,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  viewButton: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },

  viewText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
