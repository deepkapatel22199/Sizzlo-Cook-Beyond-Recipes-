import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const creators = [
  {
    id: "1",
    name: "Maya Cooks",
    username: "@mayacooks",
    bio: "Healthy homemade recipes for busy cooks.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    recipes: 24,
    likes: "5.2k",
    posts: [
      {
        id: "1",
        title: "Creamy Tomato Pasta",
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
      },
      {
        id: "2",
        title: "Avocado Toast",
        image:
          "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
      },
      {
        id: "3",
        title: "Chickpea Bowl",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
      },
      {
        id: "4",
        title: "Fruit Pancakes",
        image:
          "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800",
      },
    ],
  },
];

export default function CreatorProfile() {
  const { id } = useLocalSearchParams();

  const creator = creators.find((item) => item.id === id) || creators[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: creator.avatar }} style={styles.avatar} />

          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.username}>{creator.username}</Text>
          <Text style={styles.bio}>{creator.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{creator.recipes}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{creator.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12k</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <View style={styles.activeTab}>
            <Ionicons name="grid-outline" size={20} color="#F97316" />
            <Text style={styles.activeTabText}>Recipes</Text>
          </View>
        </View>

        {/* Recipe Grid */}
        <View style={styles.grid}>
          {creator.posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.gridItem}
              onPress={() => router.push(`/community/post/${post.id}` as any)}
            >
              <Image source={{ uri: post.image }} style={styles.gridImage} />

              <View style={styles.overlay}>
                <Text numberOfLines={1} style={styles.gridTitle}>
                  {post.title}
                </Text>
              </View>
            </TouchableOpacity>
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

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  profileSection: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 20,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 55,
    marginBottom: 14,
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
  },

  bio: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  tabRow: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  activeTab: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  activeTabText: {
    color: "#F97316",
    fontWeight: "800",
  },

  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  gridItem: {
    width: "48%",
    height: 180,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },

  gridImage: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  gridTitle: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
});