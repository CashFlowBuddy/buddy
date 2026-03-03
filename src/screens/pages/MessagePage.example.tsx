import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, type Socket } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient, getAuthCookieHeader } from "@/lib/auth-client";
import type { ChatMessage, TypingPayload } from "@/lib/types";

const SOCKET_URL = "https://api.saserver.hu";

function getErrorMessage(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: string }).message;
        if (typeof message === "string" && message.length > 0) {
            return message;
        }
    }

    return "Unknown socket error";
}

function normalizeMessage(message: Partial<ChatMessage>): ChatMessage {
    return {
        id: message.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        content: message.content ?? "",
        byUserId: message.byUserId ?? "",
        chatRoomId: message.chatRoomId ?? "",
        createdAt: message.createdAt ?? new Date().toISOString(),
        updatedAt: message.updatedAt ?? new Date().toISOString(),
    };
}

export default function MessagePage() {
    const { data: session } = authClient.useSession();
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const selfTypingRef = useRef(false);
    const joinedRoomIdRef = useRef<string | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [chatRoomIdInput, setChatRoomIdInput] = useState("");
    const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

    const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? "";

    useEffect(() => {
        joinedRoomIdRef.current = joinedRoomId;
    }, [joinedRoomId]);

    const emitTyping = useCallback((isTyping: boolean) => {
        const socket = socketRef.current;
        if (!socket || !joinedRoomId) {
            return;
        }

        socket.emit("typing", {
            chatRoomId: joinedRoomId,
            isTyping,
        });
    }, [joinedRoomId]);

    const handleSocketConnect = useCallback(() => {
        setIsConnected(true);
        setConnectionError(null);
    }, []);

    const handleSocketDisconnect = useCallback(() => {
        setIsConnected(false);
        setTypingUsers({});
    }, []);

    const handleSocketError = useCallback((error: unknown) => {
        setConnectionError(getErrorMessage(error));
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const setupSocket = async () => {
            const cookieHeader = await getAuthCookieHeader();

            if (isCancelled) {
                return;
            }

            const socket = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                extraHeaders: cookieHeader ? { Cookie: cookieHeader } : undefined,
            });

            socketRef.current = socket;

            socket.on("connect", handleSocketConnect);
            socket.on("disconnect", handleSocketDisconnect);
            socket.on("error", handleSocketError);
            socket.on("messageHistory", (history: Partial<ChatMessage>[]) => {
                setMessages(history.map((entry) => normalizeMessage(entry)));
                setConnectionError(null);
            });
            socket.on("newMessage", (message: Partial<ChatMessage>) => {
                const normalized = normalizeMessage(message);
                setMessages((previous) => {
                    if (previous.some((entry) => entry.id === normalized.id)) {
                        return previous;
                    }
                    return [...previous, normalized];
                });
            });
            socket.on("userTyping", (payload: TypingPayload) => {
                setTypingUsers((previous) => {
                    const next = { ...previous };
                    if (payload.isTyping) {
                        next[payload.userId] = payload.userName;
                    } else {
                        delete next[payload.userId];
                    }
                    return next;
                });
            });
        };

        setupSocket();

        return () => {
            isCancelled = true;
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
                socket.emit("leaveRoom", { chatRoomId: joinedRoomIdRef.current });
            }

            socket?.removeAllListeners();
            socket?.disconnect();
            socketRef.current = null;
        };
    }, [handleSocketConnect, handleSocketDisconnect, handleSocketError]);

    const joinRoom = useCallback(() => {
        const socket = socketRef.current;
        const chatRoomId = chatRoomIdInput.trim();

        if (!chatRoomId) {
            setConnectionError("Enter a chat room ID first.");
            return;
        }

        if (!socket || !socket.connected) {
            setConnectionError("Socket is not connected yet.");
            return;
        }

        if (joinedRoomId && joinedRoomId !== chatRoomId) {
            socket.emit("leaveRoom", { chatRoomId: joinedRoomId });
        }

        setMessages([]);
        setTypingUsers({});
        setJoinedRoomId(chatRoomId);
        setConnectionError(null);
        socket.emit("joinRoom", { chatRoomId });
    }, [chatRoomIdInput, joinedRoomId]);

    const leaveRoom = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || !joinedRoomId) {
            return;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (selfTypingRef.current) {
            emitTyping(false);
            selfTypingRef.current = false;
        }

        socket.emit("leaveRoom", { chatRoomId: joinedRoomId });
        setJoinedRoomId(null);
        setMessages([]);
        setTypingUsers({});
    }, [emitTyping, joinedRoomId]);

    const handleMessageInputChange = useCallback((value: string) => {
        setMessageInput(value);

        if (!joinedRoomId) {
            return;
        }

        if (value.trim().length > 0 && !selfTypingRef.current) {
            emitTyping(true);
            selfTypingRef.current = true;
        }

        if (value.trim().length === 0 && selfTypingRef.current) {
            emitTyping(false);
            selfTypingRef.current = false;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (selfTypingRef.current) {
                emitTyping(false);
                selfTypingRef.current = false;
            }
        }, 300);
    }, [emitTyping, joinedRoomId]);

    const sendMessage = useCallback(() => {
        const socket = socketRef.current;
        const content = messageInput.trim();

        if (!socket || !joinedRoomId || !content) {
            return;
        }

        socket.emit("sendMessage", {
            chatRoomId: joinedRoomId,
            content,
        });

        if (selfTypingRef.current) {
            emitTyping(false);
            selfTypingRef.current = false;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        setMessageInput("");
    }, [emitTyping, joinedRoomId, messageInput]);

    const typingLabel = useMemo(() => {
        const names = Object.values(typingUsers);
        if (names.length === 0) {
            return "";
        }

        if (names.length === 1) {
            return `${names[0]} is typing...`;
        }

        return `${names.slice(0, 2).join(", ")} and others are typing...`;
    }, [typingUsers]);

    return (
        <SafeAreaView className="flex-1 w-full bg-background" edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View className="flex-1 px-4 py-3" style={{ alignSelf: "stretch" }}>
                    <Text variant="h3">Messages</Text>

                    <View className="mt-2 mb-3">
                        <Text variant="small">
                            {isConnected ? "Connected" : "Disconnected"}
                            {joinedRoomId ? ` • Room: ${joinedRoomId}` : " • No room joined"}
                        </Text>
                        {connectionError ? (
                            <Text variant="muted" className="text-destructive mt-1">
                                {connectionError}
                            </Text>
                        ) : null}
                    </View>

                    <View className="flex-row items-center gap-2 mb-3">
                        <Input
                            className="flex-1"
                            value={chatRoomIdInput}
                            onChangeText={setChatRoomIdInput}
                            placeholder="Chat room UUID"
                            autoCapitalize="none"
                        />
                        <Button size="sm" onPress={joinRoom}>
                            <Text>Join</Text>
                        </Button>
                        <Button size="sm" variant="outline" onPress={leaveRoom} disabled={!joinedRoomId}>
                            <Text>Leave</Text>
                        </Button>
                    </View>

                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => item.id || `${index}`}
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
                        renderItem={({ item }) => {
                            const isOwnMessage = currentUserId.length > 0 && item.byUserId === currentUserId;

                            return (
                                <View
                                    className={`rounded-md border px-3 py-2 ${isOwnMessage ? "self-end" : "self-start"}`}
                                >
                                    {!isOwnMessage ? (
                                        <Text variant="small" className="mb-1">
                                            {item.byUserId}
                                        </Text>
                                    ) : null}
                                    <Text>{item.content}</Text>
                                    <Text variant="muted" className="mt-1">
                                        {new Date(item.createdAt).toLocaleTimeString()}
                                    </Text>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-10">
                                <Text variant="muted">
                                    {joinedRoomId
                                        ? "No messages yet. Start the conversation."
                                        : "Join a room to load chat history."}
                                </Text>
                            </View>
                        }
                    />

                    <View className="mt-2 min-h-6 justify-center">
                        {typingLabel ? <Text variant="muted">{typingLabel}</Text> : null}
                    </View>

                    <View className="mt-2 flex-row items-center gap-2">
                        <Input
                            className="flex-1"
                            value={messageInput}
                            onChangeText={handleMessageInputChange}
                            placeholder={joinedRoomId ? "Type a message" : "Join a room to send messages"}
                            editable={Boolean(joinedRoomId)}
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                        />
                        <Button
                            onPress={sendMessage}
                            disabled={!joinedRoomId || messageInput.trim().length === 0}
                        >
                            <Text>Send</Text>
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}