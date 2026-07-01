import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRecipe } from "@/contexts/RecipeContext";

export default function CreateRecipe() {
    const { updateRecipe } = useRecipe();
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("15");
  const [cookTime, setCookTime] = useState("20");
  const [servings, setServings] = useState("2");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  const goNext = () => {
  if (!recipeName.trim()) {
    Alert.alert("Recipe Name Required");
    return;
  }

  if (!description.trim()) {
    Alert.alert("Description Required");
    return;
  }

  if (!prepTime.trim()) {
    Alert.alert("Prep Time Required");
    return;
  }

  if (!cookTime.trim()) {
    Alert.alert("Cook Time Required");
    return;
  }

  if (!servings.trim()) {
    Alert.alert("Servings Required");
    return;
  }

//   if (!category.trim()) {
//     Alert.alert("Please Select Category");
//     return;
//   }

  updateRecipe({
    title: recipeName,
    description,
    prepTime,
    cookTime,
    servings,
    category,
    difficulty,
  });

  router.push("/add-ingredients");
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Create Recipe
          </Text>

          <TouchableOpacity>
            <Text style={styles.saveDraft}>
              Save Draft
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoBox}>
          <Ionicons
            name="camera-outline"
            size={34}
            color="#075B34"
          />

          <Text style={styles.photoTitle}>
            Add Cover Photo
          </Text>

          <Text style={styles.photoSub}>
            Show off your delicious recipe!
          </Text>
        </TouchableOpacity>

        {/* Recipe Name */}
        <Text style={styles.label}>Recipe Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. High Protein Quinoa Bowl"
          value={recipeName}
          onChangeText={setRecipeName}
        />

        {/* Description */}
        <Text style={styles.label}>
          Short Description
        </Text>

        <TextInput
          style={[styles.input, styles.description]}
          placeholder="e.g. A healthy protein-packed bowl perfect for lunch or dinner."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Times */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Prep Time
            </Text>

            <TextInput
              style={styles.statInput}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Cook Time
            </Text>

            <TextInput
              style={styles.statInput}
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Servings
            </Text>

            <TextInput
              style={styles.statInput}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>

        <TouchableOpacity style={styles.dropdown}>
          <Text
            style={{
              color: category ? "#111" : "#999",
            }}
          >
            {category || "Select category"}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {/* Difficulty */}
        <Text style={styles.label}>
          Difficulty Level
        </Text>

        <View style={styles.difficultyRow}>
          {["Easy", "Medium", "Hard"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.difficultyButton,
                difficulty === item &&
                  styles.activeDifficulty,
              ]}
              onPress={() =>
                setDifficulty(item)
              }
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === item &&
                    styles.activeDifficultyText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={goNext}
        >
          <Text style={styles.nextButtonText}>
            Next: Add Ingredients
          </Text>
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
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  saveDraft: {
    color: "#075B34",
    fontWeight: "700",
  },

  photoBox: {
    height: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CFCFCF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  photoTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  photoSub: {
    marginTop: 5,
    fontSize: 13,
    color: "#777",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 18,
  },

  description: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "31%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#fff",
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
  },

  statInput: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },

  dropdown: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  difficultyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  difficultyButton: {
    width: "31%",
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  activeDifficulty: {
    backgroundColor: "#075B34",
    borderColor: "#075B34",
  },

  difficultyText: {
    color: "#111",
    fontWeight: "600",
  },

  activeDifficultyText: {
    color: "#fff",
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
    fontWeight: "700",
  },
});
