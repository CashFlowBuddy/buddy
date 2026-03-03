import React, { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MessageStackParamList } from "@/navigation/MessageNavigation";

type Props = NativeStackScreenProps<MessageStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { chatRoomId, users } = route.params;
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? "";

  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of users) {
      map[u.id] = u.name;
    }
    return map;
  }, [users]);

  const {
    isConnected,
    joinedRoomId,
    joinRoom,
    leaveRoom,
    messages,
    sendMessage,
    typingLabel,
    handleTyping,
  } = useChatSocket(currentUserId);

  const [messageInput, setMessageInput] = useState("");

  const reversedMessages = useMemo(
    () => [...messages].reverse(),
    [messages],
  );

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
      <FlatList
        data={reversedMessages}
        inverted
        keyExtractor={(item, index) => item.id || `${index}`}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => {
          const isOwnMessage =
            currentUserId.length > 0 &&
            item.byUserId === currentUserId;

          return (
            <View
              className={`rounded-md px-3 py-2 border ${
              isOwnMessage 
                ? "self-end border-secondary"
                : "self-start border-primary bg-primary-foreground"
              }`}
            >
              {!isOwnMessage ? (
              <Text variant="small" className="mb-1">
                {userNameMap[item.byUserId] ?? item.byUserId}
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

      <KeyboardStickyView>
        <View className="px-4 pb-4 bg-background">
          <View className="min-h-2 justify-center">
            {typingLabel ? (
              <Text variant="muted">{typingLabel}</Text>
            ) : null}
          </View>
          <View className="flex-row items-center gap-2">
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
      </KeyboardStickyView>
    </SafeAreaView>
  );
}
