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

type Ingredient = {
  id: string;
  name: string;
  quantity: string;
};

export default function AddIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "Quinoa", quantity: "1 cup" },
    { id: "2", name: "Chicken Breast", quantity: "200 g" },
  ]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const addIngredient = () => {
    if (!name.trim() || !quantity.trim()) {
      Alert.alert("Missing Info", "Please enter ingredient and quantity.");
      return;
    }

    const newIngredient = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantity.trim(),
    };

    setIngredients([...ingredients, newIngredient]);
    setName("");
    setQuantity("");
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  const goNext = () => {
    if (ingredients.length === 0) {
      Alert.alert("Add Ingredients", "Please add at least one ingredient.");
      return;
    }

    router.push("/add-steps");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Ingredients</Text>

          <TouchableOpacity>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={22} color="#075B34" />
          <Text style={styles.tipText}>
            Add all the ingredients and their quantities.
          </Text>
        </View>

        <View style={styles.addBox}>
          <Text style={styles.label}>Ingredient Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Quinoa"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1 cup"
            placeholderTextColor="#999"
            value={quantity}
            onChangeText={setQuantity}
          />

          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Ionicons name="add" size={20} color="#075B34" />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {ingredients.map((item) => (
            <View key={item.id} style={styles.ingredientCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="nutrition-outline" size={22} color="#075B34" />
              </View>

              <View style={styles.ingredientTextWrap}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.ingredientQty}>{item.quantity}</Text>
              </View>

              <TouchableOpacity onPress={() => removeIngredient(item.id)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>Next: Add Steps</Text>
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

  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    marginBottom: 13,
    fontSize: 15,
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
    marginTop: 4,
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

  ingredientCard: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF7EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  ingredientTextWrap: {
    flex: 1,
  },

  ingredientName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },

  ingredientQty: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
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