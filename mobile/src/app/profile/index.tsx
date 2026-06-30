import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { getMyProfile, UserProfile } from "@/api/profileApi";
import Avatar from "@/components/Avatar";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress?: () => void;
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user_id");
    router.replace("/login");
  };

  const menuItems: MenuItem[] = [
    {
      label: "My Recipes",
      icon: "restaurant-outline",
      onPress: () => router.push("/profile/my-recipes" as any),
    },
    { label: "Saved Recipes", icon: "bookmark-outline" },
    { label: "Settings", icon: "settings-outline" },
    { label: "Help & Support", icon: "help-circle-outline" },
    { label: "Privacy Policy", icon: "shield-checkmark-outline" },
    {
      label: "Logout",
      icon: "log-out-outline",
      danger: true,
      onPress: handleLogout,
    },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={23} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Avatar avatarUrl={profile.avatar_url} size={118} style={styles.avatar} />

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.recipes_count}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.saved_count}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/profile/edit-profile" as any)}
          >
            <Ionicons name="create-outline" size={19} color="#FFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuCard} onPress={item.onPress}>
              <View
                style={[
                  styles.menuIcon,
                  item.danger && styles.menuIconDanger,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.danger ? "#DC2626" : "#075B34"}
                />
              </View>

              <Text
                style={[
                  styles.menuText,
                  item.danger && styles.menuTextDanger,
                ]}
              >
                {item.label}
              </Text>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    paddingHorizontal: 22,
    paddingBottom: 22,
  },

  avatar: {
    marginBottom: 15,
  },

  name: {
    fontSize: 27,
    fontWeight: "800",
    color: "#111",
  },

  username: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    fontWeight: "600",
  },

  bio: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 20,
    maxWidth: 320,
  },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    fontWeight: "700",
  },

  editButton: {
    height: 50,
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#075B34",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },

  menu: {
    paddingHorizontal: 20,
    gap: 12,
  },

  menuCard: {
    minHeight: 62,
    borderRadius: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#EEF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  menuIconDanger: {
    backgroundColor: "#FEE2E2",
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  menuTextDanger: {
    color: "#DC2626",
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
