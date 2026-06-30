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
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { API_URL } from "../../../services/api";
import Avatar from "@/components/Avatar";

type CreatorProfile = {
  id: number;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string | null;
  avatar_url: string | null;
  recipes_count: number;
  recipes: {
    id: number;
    title: string;
    image: string;
    diet: string;
    cook_time: string;
    difficulty: string;
  }[];
};

export default function CreatorProfile() {
 const { id } = useLocalSearchParams();
const [creator, setCreator] = useState<CreatorProfile | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/profile`);
      const data = await response.json();

console.log("PROFILE PAGE ID:", id);
console.log("PROFILE DATA:", data);

setCreator(data);
    } catch (error) {
      console.log("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [id]);

if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );
}

if (!creator) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>User not found</Text>
    </SafeAreaView>
  );
}


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
          <Avatar avatarUrl={creator.avatar_url || creator.avatar} size={105} style={styles.avatar} />

          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.username}>@{creator.username}</Text>
          <Text style={styles.bio}>{creator.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{creator.recipes_count ?? 0}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
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
  {(creator?.recipes ?? []).map((post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.gridItem}
      onPress={() => router.push(`/community/post/${post.id}` as any)}
    >
      <Image
        source={{
          uri:
            post.image ||
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        }}
        style={styles.gridImage}
      />

      <View style={styles.overlay}>
        <Text style={styles.gridTitle} numberOfLines={1}>
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
