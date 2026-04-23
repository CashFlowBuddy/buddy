import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAuthCookieHeader } from "@/lib/auth-client";
import type { ChatMessage, TypingPayload } from "@/lib/types";
import { scheduleChatNotificationAsync } from "@/lib/notifications";

type UseChatSocketOptions = {
  conversationTitle?: string;
  participantNames?: Record<string, string>;
  enableNotifications?: boolean;
};

const SOCKET_URL = "https://api.saserver.hu";

function normalizeMessage(message: Partial<ChatMessage>): ChatMessage {
  return {
    id:
      message.id ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    content: message.content ?? "",
    byUserId: message.byUserId ?? "",
    chatRoomId: message.chatRoomId ?? "",
    createdAt: message.createdAt ?? new Date().toISOString(),
    updatedAt: message.updatedAt ?? new Date().toISOString(),
  };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: string }).message;
    if (msg) return msg;
  }

  return "Unknown socket error";
}

export function useChatSocket(
  currentUserId?: string,
  options: UseChatSocketOptions = {},
) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selfTypingRef = useRef(false);
  const joinedRoomIdRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    joinedRoomIdRef.current = joinedRoomId;
  }, [joinedRoomId]);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
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

      socket.on("connect", () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        setTypingUsers({});
      });

      socket.on("error", (err) => {
        setConnectionError(getErrorMessage(err));
      });

      socket.on("messageHistory", (history: Partial<ChatMessage>[]) => {
        setMessages(history.map(normalizeMessage));
      });

      socket.on("newMessage", (message: Partial<ChatMessage>) => {
        const normalized = normalizeMessage(message);

        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) {
            return prev;
          }
          return [...prev, normalized];
        });

        if (
          options.enableNotifications !== false &&
          currentUserId &&
          normalized.byUserId !== currentUserId &&
          joinedRoomIdRef.current !== normalized.chatRoomId
        ) {
          void scheduleChatNotificationAsync({
            conversationTitle: options.conversationTitle,
            senderName: options.participantNames?.[normalized.byUserId],
            messagePreview: normalized.content,
          });
        }
      });

      socket.on("userTyping", (payload: TypingPayload) => {
        if (payload.userId === currentUserId) return;

        setTypingUsers((prev) => {
          const next = { ...prev };

          if (payload.isTyping) {
            next[payload.userId] = payload.userName;
          } else {
            delete next[payload.userId];
          }

          return next;
        });
      });
    };

    setup();

    return () => {
      cancelled = true;

      const socket = socketRef.current;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (socket && selfTypingRef.current && joinedRoomIdRef.current) {
        socket.emit("typing", {
          chatRoomId: joinedRoomIdRef.current,
          isTyping: false,
        });
      }

      if (socket && joinedRoomIdRef.current) {
        socket.emit("leaveRoom", {
          chatRoomId: joinedRoomIdRef.current,
        });
      }

      socket?.removeAllListeners();
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, options.conversationTitle, options.participantNames]);

  const joinRoom = useCallback((roomId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setConnectionError("Socket not connected");
      return;
    }

    if (joinedRoomIdRef.current && joinedRoomIdRef.current !== roomId) {
      socket.emit("leaveRoom", {
        chatRoomId: joinedRoomIdRef.current,
      });
    }

    setMessages([]);
    setTypingUsers({});
    setJoinedRoomId(roomId);
    setConnectionError(null);

    socket.emit("joinRoom", { chatRoomId: roomId });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current;
    const roomId = joinedRoomIdRef.current;

    if (!socket || !roomId) return;

    socket.emit("leaveRoom", { chatRoomId: roomId });

    setJoinedRoomId(null);
    setMessages([]);
    setTypingUsers({});
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const socket = socketRef.current;
      const roomId = joinedRoomIdRef.current;

      if (!socket || !roomId || !content.trim()) return;

      socket.emit("sendMessage", {
        chatRoomId: roomId,
        content: content.trim(),
      });

      if (selfTypingRef.current) {
        socket.emit("typing", {
          chatRoomId: roomId,
          isTyping: false,
        });
        selfTypingRef.current = false;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    []
  );


  const handleTyping = useCallback((value: string) => {
    const socket = socketRef.current;
    const roomId = joinedRoomIdRef.current;

    if (!socket || !roomId) return;

    const trimmed = value.trim();

    if (trimmed.length > 0 && !selfTypingRef.current) {
      socket.emit("typing", {
        chatRoomId: roomId,
        isTyping: true,
      });
      selfTypingRef.current = true;
    }

    if (trimmed.length === 0 && selfTypingRef.current) {
      socket.emit("typing", {
        chatRoomId: roomId,
        isTyping: false,
      });
      selfTypingRef.current = false;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selfTypingRef.current) {
        socket.emit("typing", {
          chatRoomId: roomId,
          isTyping: false,
        });
        selfTypingRef.current = false;
      }
    }, 500);
  }, []);


  const typingLabel = useMemo(() => {
    const names = Object.values(typingUsers);

    if (names.length === 0) return "";
    if (names.length === 1) return `${names[0]} is typing...`;

    return `${names.slice(0, 2).join(", ")} and others are typing...`;
  }, [typingUsers]);

  return {
    isConnected,
    connectionError,

    joinedRoomId,
    joinRoom,
    leaveRoom,

    messages,
    sendMessage,

    typingUsers,
    typingLabel,
    handleTyping,
  };
}