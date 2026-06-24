import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipe } from "./context/RecipeContext";
import { API_URL } from "../services/api";
import * as SecureStore from "expo-secure-store";


export default function PreviewRecipe() {
  const { recipe, resetRecipe } = useRecipe();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const publishRecipe = async () => {
  try {
    const token = await SecureStore.getItem("token");
    console.log("TOKEN:", token);

    if (!token) {
      alert("Please login first");
      router.replace("/login");
      return;
    }

    const response = await fetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: recipe.title,
        description: recipe.description,
        image: recipe.photos[0] || "",
        cook_time: `${recipe.cookTime} mins`,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        diet: recipe.category || "Recipe",
        ingredients: recipe.ingredients.map(
          (item) => `${item.quantity} ${item.name}`
        ),
        steps: recipe.steps.map((step) => step.instruction),
      }),
    });

    const data = await response.json();

    console.log("Publish response:", data);

    if (response.ok) {
      setShowSuccessAlert(true);
    } else {
      console.log(data);
      alert("Failed to publish recipe");
    }
  } catch (error) {
    console.log("Publish error:", error);
    alert("Something went wrong");
  }
};


  const closeAlert = () => {
    setShowSuccessAlert(false);
    resetRecipe();
    router.push("/home");
  };

  const imageUri =
    recipe.photos.length > 0
      ? recipe.photos[0]
      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Preview Recipe</Text>

          <TouchableOpacity>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View style={styles.tipBox}>
          <Ionicons name="eye-outline" size={22} color="#075B34" />
          <Text style={styles.tipText}>
            Review your recipe before publishing it.
          </Text>
        </View>

        {/* Image */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.recipeImage}
          />

          <View style={styles.imageOverlay}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeSubText}>
                 {recipe.category || "Recipe"} • {recipe.description}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={21} color="#075B34" />
            <Text style={styles.infoValue}>{recipe.cookTime} min</Text>
            <Text style={styles.infoLabel}>Time</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="barbell-outline" size={21} color="#075B34" />
            <Text style={styles.infoValue}>{recipe.difficulty}</Text>
            <Text style={styles.infoLabel}>Level</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={21} color="#075B34" />
            <Text style={styles.infoValue}>{recipe.servings}</Text>
            <Text style={styles.infoLabel}>Serves</Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {recipe.ingredients.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.dot} />
              <Text style={styles.listText}>{item.quantity} {item.name} </Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cooking Steps</Text>

           {recipe.steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>

              <Text style={styles.stepText}>{step.instruction}</Text>
            </View>
          ))}
        </View>

        {/* Publish Button */}
        <TouchableOpacity style={styles.publishButton} onPress={publishRecipe}>
          <Text style={styles.publishButtonText}>Publish Recipe</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Custom Alert */}
      <Modal transparent visible={showSuccessAlert} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertIconBox}>
              <Ionicons name="checkmark-circle" size={62} color="#075B34" />
            </View>

            <Text style={styles.alertTitle}>Recipe Published!</Text>

            <Text style={styles.alertMessage}>
              Your recipe is now live on Sizzlo. People can discover, save, and
              cook it.
            </Text>

            <TouchableOpacity style={styles.alertButton} onPress={closeAlert}>
              <Text style={styles.alertButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  imageCard: {
    height: 230,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 16,
  },

  recipeImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: 14,
  },

  recipeTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },

  recipeSubText: {
    color: "#F3F4F6",
    fontSize: 13,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  infoCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    alignItems: "center",
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginTop: 6,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginBottom: 14,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#075B34",
    marginRight: 10,
  },

  listText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },

  stepItem: {
    flexDirection: "row",
    marginBottom: 14,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#075B34",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  stepNumberText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
  },

  publishButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#075B34",
    justifyContent: "center",
    alignItems: "center",
  },

  publishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  alertCard: {
    width: "100%",
    backgroundColor: "#FFFDF8",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  alertIconBox: {
    marginBottom: 14,
  },

  alertTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },

  alertMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
  },

  alertButton: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#075B34",
    justifyContent: "center",
    alignItems: "center",
  },

  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});