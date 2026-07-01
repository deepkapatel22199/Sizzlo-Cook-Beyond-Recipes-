import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRecipe } from "@/contexts/RecipeContext";

type RecipeStep = {
  id: string;
  instruction: string;
};

export default function AddSteps() {

  const { updateRecipe } = useRecipe();
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [instruction, setInstruction] = useState("");

  const addStep = () => {
    if (!instruction.trim()) {
      Alert.alert("Missing Step", "Please enter a cooking step.");
      return;
    }

    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        instruction: instruction.trim(),
      },
    ]);

    setInstruction("");
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const goNext = () => {
    if (steps.length === 0) {
      Alert.alert("Add Steps", "Please add at least one cooking step.");
      return;
    }

    updateRecipe({
    steps,
  });

    router.push("/upload-photos");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Steps</Text>

          <TouchableOpacity>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={22} color="#075B34" />
          <Text style={styles.tipText}>
            Break down your recipe into simple steps.
          </Text>
        </View>

        <View style={styles.addBox}>
          <Text style={styles.label}>Cooking Step</Text>

          <TextInput
            style={styles.stepInput}
            placeholder="e.g. Rinse quinoa and cook for 15 minutes."
            placeholderTextColor="#999"
            multiline
            value={instruction}
            onChangeText={setInstruction}
          />

          <TouchableOpacity style={styles.addButton} onPress={addStep}>
            <Ionicons name="add" size={20} color="#075B34" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Step {index + 1}</Text>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
              </View>

              <TouchableOpacity onPress={() => removeStep(step.id)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>Next: Upload Photos</Text>
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

  addBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 7,
  },

  stepInput: {
    minHeight: 90,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: "#FFF",
    marginBottom: 13,
    fontSize: 15,
    textAlignVertical: "top",
  },

  addButton: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#075B34",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    marginLeft: 6,
    color: "#075B34",
    fontSize: 15,
    fontWeight: "800",
  },

  list: {
    marginBottom: 20,
  },

  stepCard: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#075B34",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  stepTextWrap: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginBottom: 3,
  },

  stepInstruction: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    fontWeight: "500",
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
