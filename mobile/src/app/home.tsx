import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const recommendedRecipes = [
  { id: "1", title: "Honey Garlic Salmon Bowl", time: "25 mins", difficulty: "Easy", rating: "4.8" },
  { id: "2", title: "Avocado Toast with Egg", time: "15 mins", difficulty: "Easy", rating: "4.9" },
  { id: "3", title: "Quinoa Veggie Bowl", time: "20 mins", difficulty: "Easy", rating: "4.7" },
];


export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="restaurant-outline" size={30} color="#075B34" />
            <Text style={styles.logo}>Sizz<Text style={styles.orange}>lo</Text></Text>
          </View>

          <TouchableOpacity style={styles.bell}>
            <Ionicons name="notifications-outline" size={28} color="#075B34" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>Hi Chef! 👋</Text>
        <Text style={styles.subGreeting}>What are we cooking today?</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={22} color="#6B7280" />
          <TextInput
            placeholder="Search recipes, ingredients..."
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
          />
          <Ionicons name="options-outline" size={22} color="#6B7280" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.aiBadge}>✦ AI RECOMMENDATION</Text>
            <Text style={styles.heroTitle}>Grilled Chicken{"\n"}Power Bowl</Text>
            <Text style={styles.heroSub}>High protein, low carb,{"\n"}ready in 25 mins</Text>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Recipe</Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={48} color="#075B34" />
          </View>
        </View>

        <SectionHeader title="Categories" />

        <View style={styles.categories}>
          <Category icon="food-variant" label="Salads" />
          <Category icon="bowl-mix-outline" label="Soups" />
          <Category icon="food-drumstick-outline" label="Chicken" />
          <Category icon="noodles" label="Pasta" />
          <Category icon="cake-variant-outline" label="Desserts" />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </View>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <View style={styles.recipeGrid}>
          {recommendedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </View>

        <View style={styles.askCard}>
          <View style={styles.askIconBox}>
            <Ionicons name="restaurant-outline" size={36} color="#075B34" />
          </View>

          <View style={styles.askTextWrap}>
            <Text style={styles.askTitle}>Ask AI Chef</Text>
            <Text style={styles.askSub}>Get recipe ideas, cooking tips{"\n"}and more with AI</Text>
          </View>

          <TouchableOpacity style={styles.askButton}>
            <Text style={styles.askButtonText}>Ask Now ✨</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 95 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/create-recipe")}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" active />
        <NavItem icon="heart-outline" label="Saved" />
        <NavItem icon="restaurant-outline" label="AI Chef" />
        <NavItem icon="people-outline" label="Community" onPress={() => router.push("/community")}/>
        <NavItem icon="person-outline" label="Profile" onPress={() => router.push("/profile" as any)} />
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.viewAll}>View all</Text>
    </View>
  );
}

function Category({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryBox}>
        <MaterialCommunityIcons name={icon} size={28} color="#075B34" />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <View style={styles.recipeCard}>
      <View style={styles.recipeImagePlaceholder}>
        <Ionicons name="image-outline" size={32} color="#B8B8B8" />
      </View>

      <TouchableOpacity style={styles.heart}>
        <Ionicons name="heart-outline" size={20} color="#6B7280" />
      </TouchableOpacity>

      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        <View style={styles.recipeMeta}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.metaText}>{recipe.time}</Text>
        </View>

        <View style={styles.recipeMeta}>
          <FontAwesome name="star" size={12} color="#F59E0B" />
          <Text style={styles.metaText}>
            {recipe.rating} • {recipe.difficulty}
          </Text>
        </View>
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={23}
        color={active ? "#075B34" : "#6B7280"}
      />

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>

      {active && <View style={styles.activeLine} />}
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#075B34",
    marginLeft: 7,
  },
  orange: {
    color: "#F46B08",
  },
  bell: {
    position: "relative",
  },
  dot: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  greeting: {
    fontSize: 27,
    fontWeight: "800",
    color: "#075B34",
    marginTop: 28,
  },
  subGreeting: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
    marginTop: 3,
    marginBottom: 18,
  },
  searchBox: {
    height: 50,
    borderRadius: 17,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14.5,
    fontWeight: "500",
  },
  heroCard: {
    height: 200,
    borderRadius: 20,
    backgroundColor: "#EEF7EE",
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 22,
  },
  heroContent: {
    flex: 1.1,
    padding: 15,
  },
  aiBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#075B34",
    marginBottom: 9,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    color: "#075B34",
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
    marginTop: 6,
    marginBottom: 11,
  },
  viewButton: {
    width: 120,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#006B3C",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "800",
  },
  heroImagePlaceholder: {
    flex: 0.9,
    backgroundColor: "#E2F1E4",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#075B34",
  },
  sectionSub: {
    fontSize: 12.2,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 3,
    maxWidth: 260,
  },
  viewAll: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#075B34",
    marginTop: 3,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: "center",
  },
  categoryBox: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: "#EEF7EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },
  recipeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  recipeCard: {
    width: "31.5%",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 82,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },
  heart: {
    position: "absolute",
    top: 7,
    right: 7,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    padding: 3,
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 12.3,
    fontWeight: "800",
    color: "#111",
    lineHeight: 16,
    marginBottom: 7,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 10.5,
    color: "#4B5563",
    fontWeight: "600",
  },
  askCard: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#EEF7EE",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
  },
  askIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  askTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  askTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#075B34",
  },
  askSub: {
    fontSize: 12.3,
    lineHeight: 17,
    color: "#4B5563",
    marginTop: 2,
  },
  askButton: {
    width: 94,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
  },
  askButtonText: {
    fontSize: 12.5,
    color: "#fff",
    fontWeight: "800",
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    elevation: 8,
  },
  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    fontSize: 10.5,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#075B34",
    fontWeight: "800",
  },
  activeLine: {
    width: 24,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#075B34",
    marginTop: 4,
  },
});
