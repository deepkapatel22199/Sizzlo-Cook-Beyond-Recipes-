import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipe } from "./context/RecipeContext";

export default function UploadPhotos() {
    const { updateRecipe } = useRecipe();
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...selectedImages]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const goNext = () => {
    // if (photos.length === 0) {
    //   Alert.alert("Add Photos", "Please upload at least one recipe photo.");
    //   return;
    // }
    updateRecipe({
        photos,
    });
    router.push("/preview-recipe");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Upload Photos</Text>

          <TouchableOpacity>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="image-outline" size={22} color="#075B34" />
          <Text style={styles.tipText}>
            Add clear food photos to make your recipe more attractive.
          </Text>
        </View>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={30} color="#075B34" />
          </View>

          <Text style={styles.uploadTitle}>Upload Recipe Photos</Text>
          <Text style={styles.uploadSubText}>
            Tap here to choose photos from your gallery.
          </Text>
        </TouchableOpacity>

        {photos.length > 0 && (
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Selected Photos</Text>

            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoCard}>
                  <Image source={{ uri }} style={styles.photo} />

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>Next: Preview Recipe</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  saveText: {
    color: "#075B34",
    fontWeight: "700",
  },

  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF7EE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  tipText: {
    flex: 1,
    marginLeft: 10,
    color: "#075B34",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  uploadBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#075B34",
    marginBottom: 18,
    alignItems: "center",
  },

  uploadIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#EEF7EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 5,
  },

  uploadSubText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 19,
  },

  photoSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  photoCard: {
    width: "48%",
    height: 145,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 12,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  nextButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#075B34",
    justifyContent: "center",
    alignItems: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});