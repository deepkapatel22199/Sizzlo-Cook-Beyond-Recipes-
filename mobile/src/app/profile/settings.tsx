import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
};

function SettingsRow({ icon, label, value, danger, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={21} color={danger ? "#DC2626" : "#075B34"} />
      </View>

      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>

      {value ? <Text style={styles.rowValue}>{value}</Text> : null}

      <Ionicons name="chevron-forward" size={19} color="#A1A1AA" />
    </TouchableOpacity>
  );
}

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ icon, label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={21} color="#075B34" />
      </View>

      <Text style={styles.rowLabel}>{label}</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#FDBA74" }}
        thumbColor={value ? "#F97316" : "#FFF"}
      />
    </View>
  );
}

export default function Settings() {
  const [autoplayVideos, setAutoplayVideos] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user_id");
    await SecureStore.deleteItemAsync("name");
    await SecureStore.deleteItemAsync("email");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={25} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => router.push("/profile/edit-profile" as any)}
            />
            <SettingsRow
              icon="lock-closed-outline"
              label="Change Password"
              // TODO: Connect to password change flow when backend support is ready.
            />
            <SettingsRow
              icon="mail-outline"
              label="Email Preferences"
              // TODO: Connect to email preference settings when backend support is ready.
            />
            <SettingsRow
              icon="link-outline"
              label="Connected Accounts"
              // TODO: Connect social account linking when backend support is ready.
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="color-palette-outline"
              label="Theme"
              value="System"
              // TODO: Persist theme preference when app settings storage is ready.
            />
            <SettingsRow
              icon="scale-outline"
              label="Units"
              value="US"
              // TODO: Persist measurement units when app settings storage is ready.
            />
            <SettingsRow
              icon="people-outline"
              label="Default Servings"
              value="4"
              // TODO: Persist default serving size when app settings storage is ready.
            />
            <ToggleRow
              icon="play-circle-outline"
              label="Autoplay Videos"
              value={autoplayVideos}
              onValueChange={setAutoplayVideos}
            />
            <ToggleRow
              icon="notifications-outline"
              label="Push Notifications"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <ToggleRow
              icon="cloud-offline-outline"
              label="Offline Mode"
              value={offlineMode}
              onValueChange={setOfflineMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              // TODO: Open privacy policy document or route when available.
            />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Service"
              // TODO: Open terms of service document or route when available.
            />
            <SettingsRow
              icon="server-outline"
              label="Manage Data"
              // TODO: Connect account data export/delete management when backend support is ready.
            />
            <SettingsRow
              icon="trash-outline"
              label="Delete Account"
              danger
              // TODO: Add confirmation and backend delete-account request when supported.
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="help-circle-outline"
              label="Help & Support"
              // TODO: Open help center when available.
            />
            <SettingsRow
              icon="chatbubble-ellipses-outline"
              label="Contact Us"
              // TODO: Connect to support email, chat, or help center when available.
            />
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>App Version</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 28 }} />
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

  headerSpacer: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#777",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  row: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EFE7DD",
  },

  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowIconDanger: {
    backgroundColor: "#FEE2E2",
  },

  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  rowLabelDanger: {
    color: "#DC2626",
  },

  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777",
    marginRight: 8,
  },

  versionRow: {
    marginTop: 12,
    minHeight: 56,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  versionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },

  versionValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#777",
  },

  logoutButton: {
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

  logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626",
  },
});
