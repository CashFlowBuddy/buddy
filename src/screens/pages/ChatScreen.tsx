import React, { useCallback, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MessageStackParamList } from "@/navigation/MessageNavigation";

type Props = NativeStackScreenProps<MessageStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { chatRoomId, title } = route.params;
  const { data: session } = authClient.useSession();
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? "";

  const {
    isConnected,
    connectionError,
    joinedRoomId,
    joinRoom,
    leaveRoom,
    messages,
    sendMessage,
    typingLabel,
    handleTyping,
  } = useChatSocket(currentUserId);

  const [messageInput, setMessageInput] = useState("");

  React.useEffect(() => {
    if (isConnected && chatRoomId && joinedRoomId !== chatRoomId) {
      joinRoom(chatRoomId);
    }
  }, [isConnected, chatRoomId, joinedRoomId, joinRoom]);

  React.useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  const handleMessageInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);
      handleTyping(value);
    },
    [handleTyping],
  );

  const handleSend = useCallback(() => {
    const content = messageInput.trim();
    if (!content) return;
    sendMessage(content);
    setMessageInput("");
  }, [messageInput, sendMessage]);

  return (
    <SafeAreaView
      className="flex-1 w-full bg-background"
      edges={["left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-1 px-4 py-3" style={{ alignSelf: "stretch" }}>
          <View className="mb-3">
            <Text variant="small">
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
            {connectionError ? (
              <Text variant="muted" className="text-destructive mt-1">
                {connectionError}
              </Text>
            ) : null}
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id || `${index}`}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
            renderItem={({ item }) => {
              const isOwnMessage =
                currentUserId.length > 0 &&
                item.byUserId === currentUserId;

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
                  No messages yet. Start the conversation.
                </Text>
              </View>
            }
          />

          <View className="mt-2 min-h-6 justify-center">
            {typingLabel ? (
              <Text variant="muted">{typingLabel}</Text>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <Input
              className="flex-1"
              value={messageInput}
              onChangeText={handleMessageInputChange}
              placeholder="Type a message"
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Button
              onPress={handleSend}
              disabled={messageInput.trim().length === 0}
            >
              <Text>Send</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
