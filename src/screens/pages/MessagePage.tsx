import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchBar } from "@/components/ui/search-bar";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom, Message } from "@/lib/interfaces";
import { getAuthCookieHeader } from "@/lib/auth-client";
import type { MessageStackParamList } from "@/navigation/MessageNavigation";
import { authClient } from "@/lib/auth-client";

type NavigationProp = NativeStackNavigationProp<
  MessageStackParamList,
  "ChatRooms"
>;

export default function MessagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const { data: session } = authClient.useSession();

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => setSearchQuery("")}
        />
      </View>

      {loading ? (
        <View className="px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} className="flex-row items-center gap-3 py-4">
              <Skeleton className="size-12 rounded-full" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </View>
              <Skeleton className="h-3 w-12" />
            </View>
          ))}
        </View>
      ) : filteredDATA.length === 0 ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text variant="muted">No conversations yet.</Text>
        </View>
      ) : (
        <ScrollView className="w-full px-6">
          {filteredDATA.map((room, index) => {
            const lastMessage = room.messages[room.messages.length - 1];
            const otherUsers = room.users.filter(
              (u) => u.id !== session?.user?.id,
            );
            const firstOther = otherUsers[0];

            return (
              <React.Fragment key={room.id}>
                <Pressable
                  className="flex-row items-center gap-3 py-4 active:opacity-70"
                  onPress={() =>
                    navigation.navigate("Chat", {
                      chatRoomId: room.id,
                      title: room.forListing.title,
                      users: room.users,
                    })
                  }
                >
                  <Avatar
                    alt={firstOther?.name ?? "User"}
                    className="size-12"
                  >
                    <AvatarImage
                      source={{ uri: "https://cash.saserver.hu" + (firstOther?.image ?? undefined) }}
                    />
                    <AvatarFallback>
                      <Text className="text-sm font-semibold">
                        {firstOther?.name?.[0]?.toUpperCase() ?? "?"}
                      </Text>
                    </AvatarFallback>
                  </Avatar>

                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-foreground">
                        {otherUsers.map((u) => u.name).join(", ")}
                      </Text>
                      <Text variant="muted" className="text-xs">
                        {lastMessage
                          ? formatTime(lastMessage.createdAt)
                          : ""}
                      </Text>
                    </View>

                    <Text variant="small" className="text-muted-foreground">
                      {room.forListing.title}
                    </Text>

                    {lastMessage ? (
                      <Text
                        variant="muted"
                        className="mt-0.5"
                        numberOfLines={1}
                      >
                        {lastMessage.content}
                      </Text>
                    ) : (
                      <Text variant="muted" className="mt-0.5 italic">
                        No messages yet
                      </Text>
                    )}
                  </View>
                </Pressable>
                {index < filteredDATA.length - 1 && (
                  <Separator orientation="horizontal" />
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
