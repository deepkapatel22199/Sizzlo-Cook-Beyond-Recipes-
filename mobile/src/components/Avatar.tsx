import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { getAvatarUrl } from "@/api/avatarApi";

type AvatarProps = {
  avatarUrl?: string | null;
  size?: number;
  iconSize?: number;
  style?: any;
};

export default function Avatar({
  avatarUrl,
  size = 46,
  iconSize,
  style,
}: AvatarProps) {
  const finalUrl = getAvatarUrl(avatarUrl);

  if (finalUrl) {
    return (
      <Image
        source={{ uri: finalUrl }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Ionicons
        name="person-outline"
        size={iconSize ?? size * 0.55}
        color="#6B7280"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#FFF3E8",
  },

  fallback: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
