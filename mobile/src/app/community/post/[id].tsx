import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import Avatar from "@/components/Avatar";
import { getRecipeImageUrl, updateRecipeImage } from "@/api/recipeImageApi";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { deleteRecipe, getRecipeById, RecipeDetail } from "@/api/recipeApi";
import {
  addRecipeComment,
  deleteRecipeComment,
  getRecipeComments,
  likeRecipe,
  RecipeComment,
  saveRecipe,
  unlikeRecipe,
  unsaveRecipe,
} from "@/api/socialApi";

export default function RecipePostDetail() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);


  useEffect(() => {
  const fetchRecipe = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const data = await getRecipeById(String(id), token);
      setRecipe(data);

      const currentUserId = await SecureStore.getItemAsync("user_id");
      setCurrentUserId(currentUserId);
      setIsOwner(Boolean(data.is_owner) || (Boolean(currentUserId) && String(currentUserId) === String(data.creator_id)));
      setComments(await getRecipeComments(Number(id)));
    } catch (error) {
      console.log("Recipe detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRecipe();
}, [id]);

const handleUploadCover = async () => {
  if (!recipe) return;

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setUploadingCover(true);
    const upload = await updateRecipeImage(token, recipe.id, result.assets[0].uri);

    setRecipe((currentRecipe) =>
      currentRecipe
        ? {
            ...currentRecipe,
            image: upload.image_url,
          }
        : currentRecipe
    );
  } catch (error: any) {
    Alert.alert("Error", error.message || "Unable to upload recipe cover.");
  } finally {
    setUploadingCover(false);
  }
};

const handleEditRecipe = () => {
  if (!recipe) return;

  router.push(`/recipe/edit/${recipe.id}` as any);
};

const handleDeleteRecipe = () => {
  if (!recipe) return;

  Alert.alert(
    "Delete Recipe?",
    "This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync("token");

            if (!token) {
              router.replace("/login");
              return;
            }

            setDeleting(true);
            await deleteRecipe(token, recipe.id);
            Alert.alert("Deleted", "Recipe deleted successfully.");
            router.replace("/profile" as any);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Unable to delete recipe.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]
  );
};

const updateRecipeSocialState = (state: {
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}) => {
  setRecipe((currentRecipe) =>
    currentRecipe
      ? {
          ...currentRecipe,
          likes_count: state.likes_count,
          comments_count: state.comments_count,
          is_liked: state.is_liked,
          is_saved: state.is_saved,
        }
      : currentRecipe
  );
};

const handleToggleLike = async () => {
  if (!recipe) return;

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const state = recipe.is_liked
      ? await unlikeRecipe(token, recipe.id)
      : await likeRecipe(token, recipe.id);
    updateRecipeSocialState(state);
  } catch (error: any) {
    Alert.alert("Error", error.message || "Unable to update like.");
  }
};

const handleToggleSave = async () => {
  if (!recipe) return;

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const state = recipe.is_saved
      ? await unsaveRecipe(token, recipe.id)
      : await saveRecipe(token, recipe.id);
    updateRecipeSocialState(state);
  } catch (error: any) {
    Alert.alert("Error", error.message || "Unable to update saved recipe.");
  }
};

const handleAddComment = async () => {
  if (!recipe) return;

  const trimmedComment = commentText.trim();

  if (!trimmedComment) return;

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const comment = await addRecipeComment(token, recipe.id, trimmedComment);
    setComments((currentComments) => [...currentComments, comment]);
    setCommentText("");
    setRecipe((currentRecipe) =>
      currentRecipe
        ? {
            ...currentRecipe,
            comments_count: currentRecipe.comments_count + 1,
          }
        : currentRecipe
    );
  } catch (error: any) {
    Alert.alert("Error", error.message || "Unable to add comment.");
  }
};

const handleDeleteComment = async (comment: RecipeComment) => {
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    await deleteRecipeComment(token, comment.id);
    setComments((currentComments) =>
      currentComments.filter((currentComment) => currentComment.id !== comment.id)
    );
    setRecipe((currentRecipe) =>
      currentRecipe
        ? {
            ...currentRecipe,
            comments_count: Math.max(0, currentRecipe.comments_count - 1),
          }
        : currentRecipe
    );
  } catch (error: any) {
    Alert.alert("Error", error.message || "Unable to delete comment.");
  }
};

if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );
}

if (!recipe) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Recipe not found</Text>
    </SafeAreaView>
  );
}

const imageUri = getRecipeImageUrl(recipe.image);
const creatorName = String(recipe.creator_name || recipe.creator?.name || "Creator");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <View>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="restaurant-outline" size={46} color="#F97316" />
              {isOwner && (
                <TouchableOpacity
                  style={styles.coverUploadButton}
                  onPress={handleUploadCover}
                  disabled={uploadingCover}
                >
                  {uploadingCover ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={18} color="#FFF" />
                      <Text style={styles.coverUploadButtonText}>Upload Cover</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.ownerActionButton} onPress={handleEditRecipe}>
                <Ionicons name="create-outline" size={18} color="#111" />
                <Text style={styles.ownerActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ownerActionButton, styles.deleteActionButton]}
                onPress={handleDeleteRecipe}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Creator */}
          <TouchableOpacity
            style={styles.creatorRow}
            onPress={() => router.push(`/community/profile/${recipe.creator_id}` as any)}
          >
            <Avatar avatarUrl={recipe.creator_avatar_url} size={48} style={styles.avatar} />

            <View>
              <Text style={styles.creatorName}>{creatorName}</Text>
              <Text style={styles.creatorSub}>Recipe Creator</Text>
            </View>
          </TouchableOpacity>

          {/* Info Cards */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color="#F97316" />
              <Text style={styles.infoText}>{recipe.cook_time}</Text>
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
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleLike}>
              <Ionicons
                name={recipe.is_liked ? "heart" : "heart-outline"}
                size={22}
                color={recipe.is_liked ? "#F97316" : "#111"}
              />
              <Text style={styles.actionText}>{recipe.likes_count} Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleToggleSave}>
              <Ionicons
                name={recipe.is_saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={recipe.is_saved ? "#F97316" : "#111"}
              />
              <Text style={styles.actionText}>{recipe.is_saved ? "Saved" : "Save"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Comments</Text>

          <View style={styles.commentComposer}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Avatar avatarUrl={comment.user.avatar_url} size={34} />
              <View style={styles.commentBody}>
                <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
              {String(currentUserId) === String(comment.user_id) && (
                <TouchableOpacity onPress={() => handleDeleteComment(comment)}>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          ))}

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

  heroPlaceholder: {
    width: "100%",
    height: 330,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },

  coverUploadButton: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  coverUploadButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
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

  ownerActions: {
    position: "absolute",
    top: 18,
    right: 18,
    flexDirection: "row",
    gap: 8,
  },

  ownerActionButton: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  deleteActionButton: {
    backgroundColor: "#FFF1F2",
  },

  ownerActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
  },

  deleteActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
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
  commentComposer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  commentInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  commentSendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
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
