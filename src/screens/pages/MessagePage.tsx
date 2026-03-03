import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchBar } from "@/components/ui/search-bar";
import { ChatRoom, Message } from "@/lib/interfaces";
import { getAuthCookieHeader } from "@/lib/auth-client";
import type { MessageStackParamList } from "@/navigation/MessageNavigation";

type NavigationProp = NativeStackNavigationProp<MessageStackParamList, "ChatRooms">;

export default function MessagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const authHeader = await getAuthCookieHeader();

      const response = await fetch("https://cash.saserver.hu/api/chat-rooms", {
        headers: {
          Cookie: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setChatRooms(data);
      } else {
        console.warn("API response is not an array:", data);
        setChatRooms([]);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDATA =
    chatRooms?.filter(
      (room) =>
        room.forListing.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        room.users.some((user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    ) || [];

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-white">
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onClear={() => setSearchQuery("")}
      />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView className="w-full px-4">
          {filteredDATA.map((room) => {
            const lastMessage = room.messages[room.messages.length - 1];
            const otherUsers = room.users.filter(
              (u) => u.id !== room.users[0].id,
            );

            return (
              <Pressable
                key={room.id}
                className="border-b border-gray-200 py-4 active:bg-gray-50"
                onPress={() =>
                  navigation.navigate("Chat", {
                    chatRoomId: room.id,
                    title: room.forListing.title,
                  })
                }
              >
                <Text className="text-base font-semibold text-gray-900">
                  {room.forListing.title}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {otherUsers.map((u) => u.name).join(", ")}
                </Text>
                {lastMessage && (
                  <Text
                    className="text-sm text-gray-600 mt-2"
                    numberOfLines={1}
                  >
                    {lastMessage.content}
                  </Text>
                )}
                <Text className="text-xs text-gray-400 mt-1">
                  {lastMessage
                    ? formatTime(lastMessage.createdAt)
                    : "No messages"}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
