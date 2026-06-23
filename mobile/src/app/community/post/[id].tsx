import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const recipes = [
  {
    id: "1",
    title: "Creamy Tomato Pasta",
    creator: "Aarav Kitchen",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    time: "25 mins",
    difficulty: "Easy",
    servings: "2 servings",
    likes: 240,
    description:
      "A rich, creamy tomato pasta made with simple ingredients and perfect for a quick dinner.",
    ingredients: ["Pasta", "Tomato sauce", "Garlic", "Cream", "Cheese"],
    steps: [
      "Boil pasta until soft.",
      "Cook garlic with tomato sauce.",
      "Add cream and mix well.",
      "Add pasta into the sauce.",
      "Top with cheese and serve hot.",
    ],
  },
];

export default function RecipePostDetail() {
  const { id } = useLocalSearchParams();

  const recipe = recipes.find((item) => item.id === id) || recipes[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <View>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Creator */}
          <TouchableOpacity
            style={styles.creatorRow}
            onPress={() => router.push(`/community/profile/${recipe.id}` as any)}
          >
            <Image source={{ uri: recipe.avatar }} style={styles.avatar} />

            <View>
              <Text style={styles.creatorName}>{recipe.creator}</Text>
              <Text style={styles.creatorSub}>Recipe Creator</Text>
            </View>
          </TouchableOpacity>

          {/* Info Cards */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color="#F97316" />
              <Text style={styles.infoText}>{recipe.time}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={20} color="#F97316" />
              <Text style={styles.infoText}>{recipe.difficulty}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="restaurant-outline" size={20} color="#F97316" />
              <Text style={styles.infoText}>{recipe.servings}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {recipe.ingredients.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.dot} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}

          {/* Steps */}
          <Text style={styles.sectionTitle}>Steps</Text>

          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>

              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Bottom Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={22} color="#111" />
              <Text style={styles.actionText}>{recipe.likes} Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={22} color="#111" />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Cooking</Text>
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

  heroImage: {
    width: "100%",
    height: 330,
  },

  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    backgroundColor: "#FAF7F2",
    marginTop: -26,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    marginBottom: 16,
  },

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  creatorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  creatorSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 26,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },

  infoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
    marginTop: 8,
  },

  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 23,
    marginBottom: 20,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
    marginRight: 12,
  },

  listText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#FFF",
    fontWeight: "800",
  },

  stepText: {
    flex: 1,
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  startButton: {
    backgroundColor: "#111",
    paddingVertical: 17,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 16,
  },

  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});