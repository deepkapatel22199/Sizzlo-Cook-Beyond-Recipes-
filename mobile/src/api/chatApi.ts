import { API_URL } from "@/services/api";
import { Creator } from "@/api/socialApi";

export type ChatSummary = {
  id: number;
  created_at: string;
  other_user: Creator | null;
  last_message: string | null;
};

export type ChatMessage = {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string;
  created_at: string;
  sender: Creator;
};

async function parseResponse(response: Response, fallbackMessage: string) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || fallbackMessage);
  }

  return data;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getChats(token: string): Promise<ChatSummary[]> {
  const response = await fetch(`${API_URL}/chats`, {
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to load chats");
}

export async function createChat(token: string, userId: number): Promise<ChatSummary> {
  const response = await fetch(`${API_URL}/chats`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  return parseResponse(response, "Unable to start chat");
}

export async function getChatMessages(
  token: string,
  chatId: number
): Promise<ChatMessage[]> {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    headers: authHeaders(token),
  });

  return parseResponse(response, "Unable to load messages");
}

export async function sendChatMessage(
  token: string,
  chatId: number,
  text: string
): Promise<ChatMessage> {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  return parseResponse(response, "Unable to send message");
}
