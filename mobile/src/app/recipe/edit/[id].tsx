import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { getRecipeById, updateRecipe } from "@/api/recipeApi";

export default function EditRecipe() {
  const { id } = useLocalSearchParams();
  const recipeId = Array.isArray(id) ? id[0] : id;

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [servings, setServings] = useState("");
  const [diet, setDiet] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("token");

        if (!savedToken) {
          router.replace("/login");
          return;
        }

        if (!recipeId) {
          Alert.alert("Error", "Recipe not found.");
          router.back();
          return;
        }

        setToken(savedToken);

        const recipe = await getRecipeById(recipeId, savedToken);
        const currentUserId = await SecureStore.getItemAsync("user_id");
        const ownsRecipe =
          Boolean(recipe.is_owner) || String(currentUserId) === String(recipe.creator_id);

        if (!ownsRecipe) {
          setAllowed(false);
          return;
        }

        setTitle(recipe.title || "");
        setDescription(recipe.description || "");
        setCookTime(recipe.cook_time || "");
        setDifficulty(recipe.difficulty || "");
        setServings(recipe.servings || "");
        setDiet(recipe.diet || "");
        setIngredients(recipe.ingredients?.length ? recipe.ingredients : [""]);
        setSteps(recipe.steps?.length ? recipe.steps : [""]);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Unable to load recipe.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId]);

  const updateListValue = (
    values: string[],
    setValues: (nextValues: string[]) => void,
    index: number,
    value: string
  ) => {
    const nextValues = [...values];
    nextValues[index] = value;
    setValues(nextValues);
  };

  const addIngredient = () => setIngredients((current) => [...current, ""]);
  const addStep = () => setSteps((current) => [...current, ""]);

  const removeIngredient = (index: number) => {
    setIngredients((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeStep = (index: number) => {
    setSteps((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = async () => {
    if (!recipeId || !token) return;

    const cleanedIngredients = ingredients
      .map((item) => item.trim())
      .filter(Boolean);
    const cleanedSteps = steps.map((step) => step.trim()).filter(Boolean);

    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a recipe title.");
      return;
    }

    try {
      setSaving(true);
      await updateRecipe(token, recipeId, {
        title: title.trim(),
        description: description.trim(),
        cook_time: cookTime.trim(),
        difficulty: difficulty.trim(),
        servings: servings.trim(),
        diet: diet.trim(),
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
      });

      Alert.alert("Recipe updated successfully");
      router.replace(`/community/post/${recipeId}` as any);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to update recipe.");
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

  if (!allowed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Recipe</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notAllowedCard}>
          <Ionicons name="lock-closed-outline" size={36} color="#F97316" />
          <Text style={styles.notAllowedText}>You are not allowed to edit this recipe.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={25} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Recipe</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recipe Info</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />

          <View style={styles.twoColumnRow}>
            <TextInput
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="Cook time"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              value={difficulty}
              onChangeText={setDifficulty}
              placeholder="Difficulty"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.twoColumnRow}>
            <TextInput
              value={servings}
              onChangeText={setServings}
              placeholder="Servings"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              value={diet}
              onChangeText={setDiet}
              placeholder="Diet"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Text style={styles.imageNote}>
            Image replacement uses the recipe detail cover upload flow for now.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <TouchableOpacity style={styles.smallButton} onPress={addIngredient}>
              <Ionicons name="add" size={17} color="#FFF" />
              <Text style={styles.smallButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={`ingredient-${index}`} style={styles.listInputRow}>
              <TextInput
                value={ingredient}
                onChangeText={(value) =>
                  updateListValue(ingredients, setIngredients, index, value)
                }
                placeholder={`Ingredient ${index + 1}`}
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.listInput]}
              />

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeIngredient(index)}
              >
                <Ionicons name="close" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <TouchableOpacity style={styles.smallButton} onPress={addStep}>
              <Ionicons name="add" size={17} color="#FFF" />
              <Text style={styles.smallButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {steps.map((step, index) => (
            <View key={`step-${index}`} style={styles.listInputRow}>
              <TextInput
                value={step}
                onChangeText={(value) => updateListValue(steps, setSteps, index, value)}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.listInput, styles.stepInput]}
              />

              <TouchableOpacity style={styles.removeButton} onPress={() => removeStep(index)}>
                <Ionicons name="close" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Recipe</Text>
          )}
        </TouchableOpacity>

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

  headerSpacer: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },

  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FAF7F2",
    borderWidth: 1,
    borderColor: "#EFE7DD",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14,
    lineHeight: 21,
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  imageNote: {
    fontSize: 12,
    color: "#777",
    fontWeight: "700",
    lineHeight: 18,
  },

  smallButton: {
    minHeight: 34,
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  smallButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  listInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  listInput: {
    flex: 1,
  },

  stepInput: {
    minHeight: 78,
    paddingTop: 14,
  },

  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },

  notAllowedCard: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 22,
    backgroundColor: "#FFF",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },

  notAllowedText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    lineHeight: 23,
  },
});
