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
import { useState } from "react";

const posts = [
  {
    id: "1",
    title: "Creamy Tomato Pasta",
    creator: "Aarav Kitchen",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    time: "25 mins",
    likes: 240,
    diet: "Vegetarian",
  },
  {
    id: "2",
    title: "Healthy Avocado Toast",
    creator: "Maya Cooks",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    time: "15 mins",
    likes: 180,
    diet: "High Protein",
  },
  {
    id: "3",
    title: "Spicy Chickpea Bowl",
    creator: "Sizzlo Chef",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    time: "20 mins",
    likes: 320,
    diet: "Vegan",
  },
];

export default function CommunityHomeFeed() {
    const [refreshing, setRefreshing] = useState(false);

const onRefresh = () => {
  setRefreshing(true);

  setTimeout(() => {
    setRefreshing(false);
  }, 1500);
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
      onPress={() => router.push("/community/profile/me" as any)}
    >
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        }}
        style={styles.profileImage}
      />
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

        {/* Feed */}
        <View style={styles.feed}>
          {posts.map((post) => (
            <View key={post.id} style={styles.card}>
              {/* Creator Row */}
              <TouchableOpacity
                style={styles.creatorRow}
                onPress={() => router.push(`/community/profile/${post.id}` as any)}
              >
                <Image source={{ uri: post.avatar }} style={styles.avatar} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.creatorName}>{post.creator}</Text>
                  <Text style={styles.creatorSub}>Shared a new recipe</Text>
                </View>

                <Ionicons name="ellipsis-horizontal" size={22} color="#777" />
              </TouchableOpacity>

              {/* Recipe Image */}
              <TouchableOpacity>
                <Image source={{ uri: post.image }} style={styles.recipeImage} />
              </TouchableOpacity>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{post.diet}</Text>
                </View>

                <Text style={styles.recipeTitle}>{post.title}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={17} color="#777" />
                    <Text style={styles.metaText}>{post.time}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons name="heart-outline" size={17} color="#777" />
                    <Text style={styles.metaText}>{post.likes} likes</Text>
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

                  <TouchableOpacity style={styles.viewButton}  onPress={() => router.push(`/community/post/${post.id}` as any)}>
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

profileImage: {
  width: "100%",
  height: "100%",
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

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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