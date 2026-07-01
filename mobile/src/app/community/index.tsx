import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import { getRecipeImageUrl } from "@/api/recipeImageApi";
import {
  addRecipeComment,
  getCommunityRecipes,
  getRecipeComments,
  likeRecipe,
  RecipeComment,
  saveRecipe,
  SocialRecipe,
  SocialState,
  unlikeRecipe,
  unsaveRecipe,
} from "@/api/socialApi";
import * as SecureStore from "expo-secure-store";

function CommunityBottomNav() {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home" as any)}>
        <Ionicons name="home-outline" size={22} color="#777" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/community" as any)}>
        <Ionicons name="people" size={22} color="#F97316" />
        <Text style={[styles.navText, styles.activeNavText]}>Community</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/chat" as any)}>
        <Ionicons name="chatbubbles-outline" size={22} color="#777" />
        <Text style={styles.navText}>Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile" as any)}>
        <Ionicons name="person-outline" size={22} color="#777" />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityHomeFeed() {
  const [posts, setPosts] = useState<SocialRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRecipeForComments, setSelectedRecipeForComments] =
    useState<SocialRecipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const applySocialState = (recipeId: number, state: SocialState) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === recipeId
          ? {
              ...post,
              likes_count: state.likes_count,
              comments_count: state.comments_count,
              is_liked: state.is_liked,
              is_saved: state.is_saved,
            }
          : post
      )
    );
  };

  const updatePost = (
    recipeId: number,
    updater: (post: SocialRecipe) => SocialRecipe
  ) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === recipeId ? updater(post) : post))
    );
  };

  const fetchRecipes = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");

      if (!storedToken) {
        router.replace("/login");
        return;
      }

      setToken(storedToken);
      const data = await getCommunityRecipes(storedToken);
      setPosts(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load community recipes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };

  const handleToggleLike = async (post: SocialRecipe) => {
    if (!token) {
      router.replace("/login");
      return;
    }

    updatePost(post.id, (currentPost) => ({
      ...currentPost,
      is_liked: !currentPost.is_liked,
      likes_count: currentPost.is_liked
        ? Math.max(0, currentPost.likes_count - 1)
        : currentPost.likes_count + 1,
    }));

    try {
      const state = post.is_liked
        ? await unlikeRecipe(token, post.id)
        : await likeRecipe(token, post.id);
      applySocialState(post.id, state);
    } catch (error: any) {
      updatePost(post.id, () => post);
      Alert.alert("Error", error.message || "Unable to update like.");
    }
  };

  const handleToggleSave = async (post: SocialRecipe) => {
    if (!token) {
      router.replace("/login");
      return;
    }

    updatePost(post.id, (currentPost) => ({
      ...currentPost,
      is_saved: !currentPost.is_saved,
    }));

    try {
      const state = post.is_saved
        ? await unsaveRecipe(token, post.id)
        : await saveRecipe(token, post.id);
      applySocialState(post.id, state);
    } catch (error: any) {
      updatePost(post.id, () => post);
      Alert.alert("Error", error.message || "Unable to update saved recipe.");
    }
  };

  const fetchComments = async (recipeId: number) => {
    try {
      setCommentsLoading(true);
      const data = await getRecipeComments(recipeId);
      setComments(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const openComments = async (recipe: SocialRecipe) => {
    setSelectedRecipeForComments(recipe);
    setComments([]);
    setCommentText("");
    setCommentsModalVisible(true);
    await fetchComments(recipe.id);
  };

  const closeComments = () => {
    setCommentsModalVisible(false);
    setSelectedRecipeForComments(null);
    setComments([]);
    setCommentText("");
  };

  const submitComment = async () => {
    const trimmedComment = commentText.trim();

    if (!selectedRecipeForComments || !trimmedComment || submittingComment) {
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSubmittingComment(true);
      const newComment = await addRecipeComment(
        token,
        selectedRecipeForComments.id,
        trimmedComment
      );

      setComments((currentComments) => [...currentComments, newComment]);
      setCommentText("");
      updatePost(selectedRecipeForComments.id, (post) => ({
        ...post,
        comments_count: post.comments_count + 1,
      }));
      setSelectedRecipeForComments((currentRecipe) =>
        currentRecipe
          ? {
              ...currentRecipe,
              comments_count: currentRecipe.comments_count + 1,
            }
          : currentRecipe
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Discover recipes from cooks</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search-outline" size={22} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {["For You", "Vegetarian", "High Protein", "Vegan", "Quick Meals"].map(
            (item, index) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryChip, index === 0 && styles.activeCategory]}
              >
                <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {loading && (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        )}

        <View style={styles.feed}>
          {posts.map((post) => {
            const imageUri = getRecipeImageUrl(post.image);
            const creatorName = String(post.creator_name || post.creator?.name || "Creator");
            const creatorAvatar = post.creator?.avatar_url || post.creator_avatar_url || null;
            const creatorId = post.creator?.id || post.creator_id;

            return (
              <View key={post.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.creatorRow}
                  onPress={() =>
                    router.push({
                      pathname: "/community/profile/[id]",
                      params: { id: String(creatorId) },
                    })
                  }
                >
                  <Avatar avatarUrl={creatorAvatar} size={46} style={styles.avatar} />

                  <View style={{ flex: 1 }}>
                    <View style={styles.creatorNameRow}>
                      <Text style={styles.creatorName}>{creatorName}</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    </View>

                    <Text style={styles.creatorSub}>Shared a new recipe</Text>
                  </View>

                  <Ionicons name="ellipsis-horizontal" size={22} color="#777" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push(`/community/post/${post.id}` as any)}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.recipeImage} />
                  ) : (
                    <View style={styles.recipeImagePlaceholder}>
                      <Ionicons name="restaurant-outline" size={36} color="#F97316" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.content}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{post.diet || "Recipe"}</Text>
                  </View>

                  <Text style={styles.recipeTitle}>{post.title}</Text>
                  {!!post.description && (
                    <Text style={styles.recipeDescription} numberOfLines={2}>
                      {post.description}
                    </Text>
                  )}

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={17} color="#777" />
                      <Text style={styles.metaText}>{post.cook_time || "25 mins"}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="chatbubble-outline" size={17} color="#777" />
                      <Text style={styles.metaText}>{post.comments_count} comments</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleLike(post)}>
                      <Ionicons
                        name={post.is_liked ? "heart" : "heart-outline"}
                        size={22}
                        color={post.is_liked ? "#F97316" : "#111"}
                      />
                      <Text style={styles.actionText}>{post.likes_count}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleSave(post)}>
                      <Ionicons
                        name={post.is_saved ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={post.is_saved ? "#F97316" : "#111"}
                      />
                      <Text style={styles.actionText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openComments(post)}
                    >
                      <Ionicons name="chatbubble-outline" size={22} color="#111" />
                      <Text style={styles.actionText}>{post.comments_count}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => router.push(`/community/post/${post.id}` as any)}
                    >
                      <Text style={styles.viewText}>View Recipe</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <CommunityBottomNav />
      <Modal
        visible={commentsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeComments}
          />

          <View style={styles.commentsSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.commentsHeader}>
              <View>
                <Text style={styles.commentsTitle}>Comments</Text>
                {selectedRecipeForComments && (
                  <Text style={styles.commentsSubtitle} numberOfLines={1}>
                    {selectedRecipeForComments.title}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeComments}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.commentsList}
              contentContainerStyle={styles.commentsListContent}
              showsVerticalScrollIndicator={false}
            >
              {commentsLoading ? (
                <ActivityIndicator color="#F97316" style={{ marginTop: 30 }} />
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Avatar avatarUrl={comment.user.avatar_url} size={36} />

                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubble-outline" size={34} color="#F97316" />
                  <Text style={styles.emptyCommentsTitle}>No comments yet</Text>
                  <Text style={styles.emptyCommentsText}>
                    Be the first to talk about this recipe.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.commentComposer}>
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.postCommentButton,
                  (!commentText.trim() || submittingComment) && styles.disabledPostButton,
                ]}
                onPress={submitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.postCommentText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryRow: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFF",
  },
  activeCategory: {
    backgroundColor: "#F97316",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  activeCategoryText: {
    color: "#FFF",
  },
  feed: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 26,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  creatorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    marginRight: 12,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  creatorSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  recipeImage: {
    width: "100%",
    height: 230,
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 230,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
  },
  tagText: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "700",
  },
  recipeTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  viewButton: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  viewText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    minHeight: 72,
    borderRadius: 24,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1E7DB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777",
  },
  activeNavText: {
    color: "#F97316",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  commentsSheet: {
    maxHeight: "78%",
    minHeight: "56%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FAF7F2",
    paddingTop: 10,
    overflow: "hidden",
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D0C5",
    alignSelf: "center",
    marginBottom: 12,
  },
  commentsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE7DD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },
  commentsSubtitle: {
    maxWidth: 260,
    fontSize: 13,
    color: "#777",
    marginTop: 3,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: 20,
    paddingBottom: 18,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111",
    marginBottom: 3,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontWeight: "500",
  },
  emptyComments: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 46,
    paddingHorizontal: 28,
  },
  emptyCommentsTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginTop: 12,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },
  commentComposer: {
    borderTopWidth: 1,
    borderTopColor: "#EFE7DD",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    maxHeight: 92,
    minHeight: 46,
    borderRadius: 17,
    backgroundColor: "#FAF7F2",
    borderWidth: 1,
    borderColor: "#EFE7DD",
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  postCommentButton: {
    minWidth: 68,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  disabledPostButton: {
    opacity: 0.5,
  },
  postCommentText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
