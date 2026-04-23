import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { AppState } from "react-native";
import { getAuthCookieHeader } from "@/lib/auth-client";
import {
  requestNotificationPermissionAsync,
  scheduleChatNotificationAsync,
} from "@/lib/notifications";

type NotificationSocketMessage = {
  id?: string;
  content?: string;
  byUserId?: string;
  chatRoomId?: string;
};

const SOCKET_URL = "https://api.saserver.hu";

function normalizeMessage(message: NotificationSocketMessage) {
  return {
    id:
      message.id ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    content: message.content ?? "",
    byUserId: message.byUserId ?? "",
    chatRoomId: message.chatRoomId ?? "",
  };
}

export function useMessageNotificationsSocket(currentUserId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let cancelled = false;

    const setup = async () => {
      // Ask for notification permissions once when the app-level socket starts.
      await requestNotificationPermissionAsync();

      const cookieHeader = await getAuthCookieHeader();
      if (cancelled) return;

      const socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        extraHeaders: cookieHeader
          ? { Cookie: cookieHeader }
          : undefined,
      });

      socketRef.current = socket;

      socket.on("newMessage", (rawMessage: NotificationSocketMessage) => {
        const message = normalizeMessage(rawMessage);

        if (!message.content) {
          return;
        }

        if (message.byUserId === currentUserId) {
          return;
        }

        // Prevent duplicate local notifications when reconnect/replay occurs.
        if (notifiedMessageIdsRef.current.has(message.id)) {
          return;
        }
        notifiedMessageIdsRef.current.add(message.id);

        // Keep cache bounded to avoid unbounded memory growth.
        if (notifiedMessageIdsRef.current.size > 500) {
          const iterator = notifiedMessageIdsRef.current.values();
          const oldest = iterator.next().value;
          if (oldest) {
            notifiedMessageIdsRef.current.delete(oldest);
          }
        }

        if (AppState.currentState === "active") {
          return;
        }

        void scheduleChatNotificationAsync({
          messagePreview: message.content,
        });
      });
    };

    void setup();

    return () => {
      cancelled = true;
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId]);
}
