import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatMessage, getChatMessages, sendChatMessage } from "@/api/chatApi";
import * as SecureStore from "expo-secure-store";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const storedUserId = await SecureStore.getItemAsync("user_id");

      if (!token) {
        router.replace("/login");
        return;
      }

      setCurrentUserId(storedUserId);
      setMessages(await getChatMessages(token, Number(id)));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || sending) return;

    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      setSending(true);
      const message = await sendChatMessage(token, Number(id), trimmedMessage);
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageText("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity style={styles.iconButton} onPress={fetchMessages}>
            <Ionicons name="refresh-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 60 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false}>
            {messages.map((message) => {
              const isMine = String(message.sender_id) === String(currentUserId);

              return (
                <View
                  key={message.id}
                  style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}
                >
                  <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                    {message.text}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={sending}>
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
  },
  keyboardView: {
    flex: 1,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  messageList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#F97316",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
  },
  messageText: {
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
    fontWeight: "600",
  },
  myMessageText: {
    color: "#FFF",
  },
  composer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAF7F2",
  },
  input: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111",
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
});
