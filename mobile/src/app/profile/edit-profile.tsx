import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { pickAndUploadAvatar } from "@/api/avatarApi";
import { getMyProfile, updateMyProfile } from "@/api/profileApi";
import Avatar from "@/components/Avatar";

export default function EditProfile() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("token");

        if (!savedToken) {
          router.replace("/login");
          return;
        }

        setToken(savedToken);

        const profile = await getMyProfile(savedToken);
        setName(profile.name);
        setUsername(profile.username);
        setBio(profile.bio);
        setAvatarUrl(profile.avatar_url);
      } catch (error) {
        console.log("Edit profile load error:", error);
        Alert.alert("Error", "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChangePhoto = async () => {
    if (!token) return;

    try {
      setUploadingAvatar(true);
      const result = await pickAndUploadAvatar(token);

      if (result?.avatar_url) {
        setAvatarUrl(result.avatar_url);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);
      await updateMyProfile(token, {
        name,
        username,
        bio,
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
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

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.avatarSection}>
          <Avatar avatarUrl={avatarUrl} size={122} style={styles.avatar} />

          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleChangePhoto}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#075B34" />
            ) : (
              <Ionicons name="camera-outline" size={19} color="#075B34" />
            )}
            <Text style={styles.photoButtonText}>
              {uploadingAvatar ? "Uploading..." : "Change Profile Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.bioInput]}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: 18,
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

  avatarSection: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 24,
  },

  avatar: {
    marginBottom: 14,
  },

  photoButton: {
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: "#EEF7EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  photoButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#075B34",
  },

  form: {
    paddingHorizontal: 20,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#075B34",
    marginBottom: 8,
    marginLeft: 4,
  },

  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  bioInput: {
    minHeight: 130,
    paddingTop: 15,
    lineHeight: 22,
  },

  saveButton: {
    height: 56,
    borderRadius: 19,
    backgroundColor: "#075B34",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#075B34",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
