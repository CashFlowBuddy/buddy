import React, { useCallback, useMemo, useState } from "react";
import { Image, ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient, getAuthCookieHeader } from "@/lib/auth-client";
import type { ChatRoom, Listing, User } from "@/lib/interfaces";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppNavigation";

type Props = NativeStackScreenProps<AppStackParamList, "ListingDetail">;

const IMAGE_BASE_URL = "https://cash.saserver.hu";
const CHAT_ROOMS_ENDPOINTS = [
  "https://api.saserver.hu/api/chat-rooms",
  "https://cash.saserver.hu/api/chat-rooms",
];

function getListingIdFromRoom(room: ChatRoom) {
  return room.forListingId ?? room.forListing?.id;
}

function hasBothUsers(room: ChatRoom, currentUserId: string, ownerId: string) {
  const userIds = room.users.map((u) => u.id);
  return userIds.includes(currentUserId) && userIds.includes(ownerId);
}

async function fetchExistingRoom(
  endpoint: string,
  headers: Record<string, string>,
  listingId: string,
  ownerId: string,
  currentUserId: string,
) {
  const existingRoomsResponse = await fetch(endpoint, {
    headers,
    credentials: "include",
  });

  if (!existingRoomsResponse.ok) {
    return null;
  }

  const rooms = (await existingRoomsResponse.json()) as ChatRoom[];
  if (!Array.isArray(rooms)) {
    return null;
  }

  return (
    rooms.find(
      (room) =>
        getListingIdFromRoom(room) === listingId &&
        hasBothUsers(room, currentUserId, ownerId),
    ) ?? null
  );
}

function formatCurrency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not set";
  }

  return new Intl.NumberFormat("hu-HU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function resolveImageUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${IMAGE_BASE_URL}${url}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-2">
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 text-base font-semibold text-foreground">{children}</Text>;
}

function buildFallbackUsers(listing: Listing, currentUser?: User): User[] {
  const users: User[] = [];

  if (currentUser) {
    users.push(currentUser);
  }

  if (listing.user && listing.user.id !== currentUser?.id) {
    users.push(listing.user);
  }

  return users;
}

export default function ListingDetailPage({ navigation, route }: Props) {
  const { listing } = route.params;
  const { data: session } = authClient.useSession();
  const currentUser = session?.user as User | undefined;
  const owner = listing.user;
  const isOwner = Boolean(currentUser?.id && owner?.id && currentUser.id === owner.id);
  const { width } = useWindowDimensions();

  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const images = useMemo(() => {
    const urls = listing.pictures
      ?.map((picture) => picture.url)
      .filter((url): url is string => Boolean(url)) ?? [];

    return urls.length > 0 ? urls : [];
  }, [listing.pictures]);

  const priceText = formatCurrency(listing.price);
  const discountedPriceText = formatCurrency(listing.discountedPrice);
  const hasDiscountedPrice = typeof listing.discountedPrice === "number";

  const openChat = useCallback(async () => {
    if (!owner) {
      setChatError("This listing does not have an owner attached.");
      return;
    }

    if (!currentUser?.id) {
      setChatError("You need to be signed in to start a chat.");
      return;
    }

    if (isOwner) {
      setChatError("You already own this listing.");
      return;
    }

    setIsStartingChat(true);
    setChatError(null);

    try {
      const authHeader = await getAuthCookieHeader();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authHeader) {
        headers.Cookie = authHeader;
      }

      let createdRoom: ChatRoom | null = null;
      let lastErrorText = "";

      for (const endpoint of CHAT_ROOMS_ENDPOINTS) {
        const existingRoom = await fetchExistingRoom(
          endpoint,
          headers,
          listing.id,
          owner.id,
          currentUser.id,
        );

        if (existingRoom?.id) {
          createdRoom = existingRoom;
          break;
        }

        const createResponse = await fetch(endpoint, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ listingId: listing.id }),
        });

        if (createResponse.ok) {
          const data = (await createResponse.json()) as ChatRoom | ChatRoom[];
          createdRoom = Array.isArray(data)
            ? data.find((room) => getListingIdFromRoom(room) === listing.id) ?? null
            : data;

          if (createdRoom?.id) {
            break;
          }
        }

        const rawError = await createResponse.text();
        lastErrorText = rawError || `HTTP ${createResponse.status}`;

        if (createResponse.status === 400 || createResponse.status === 409) {
          const roomAfterConflict = await fetchExistingRoom(
            endpoint,
            headers,
            listing.id,
            owner.id,
            currentUser.id,
          );

          if (roomAfterConflict?.id) {
            createdRoom = roomAfterConflict;
            break;
          }
        }
      }

      if (!createdRoom?.id) {
        throw new Error(
          lastErrorText
            ? `Unable to start a chat for this listing. ${lastErrorText}`
            : "Unable to start a chat for this listing.",
        );
      }

      navigation.navigate("Chat", {
        chatRoomId: createdRoom.id,
        title: listing.title,
        users:
          createdRoom.users?.length > 0
            ? createdRoom.users
            : buildFallbackUsers(listing, currentUser),
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      setChatError(
        error instanceof Error ? error.message : "Failed to start chat.",
      );
    } finally {
      setIsStartingChat(false);
    }
  }, [currentUser, isOwner, listing, navigation, owner]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[
      "left",
      "right",
      "bottom",
    ]}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-4">
        <View className="overflow-hidden rounded-3xl border border-border bg-card">
          {images.length > 0 ? (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {images.map((item, index) => (
                  <Image
                    key={`${item}-${index}`}
                    source={{ uri: resolveImageUrl(item) }}
                    style={{ width: Math.max(width - 32, 320), height: 320 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
          ) : (
            <View className="h-80 items-center justify-center bg-muted px-6">
              <Text className="text-lg font-semibold text-foreground">
                No product images
              </Text>
              <Text className="mt-2 text-sm text-muted-foreground">
                The seller did not upload any pictures for this listing.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5 gap-4">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">
              {listing.title}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-primary/10 px-3 py-1">
                <Text className="text-xs font-semibold text-primary">
                  {listing.category ?? "Uncategorized"}
                </Text>
              </View>
              {listing.status ? (
                <View className="rounded-full bg-secondary/20 px-3 py-1">
                  <Text className="text-xs font-semibold text-secondary-foreground">
                    {listing.status}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="rounded-2xl border border-border bg-card px-4 py-4">
            <SectionTitle>Description</SectionTitle>
            <Text className="text-sm leading-6 text-foreground">
              {listing.description?.trim() || "No description provided."}
            </Text>
          </View>

          <View className="rounded-2xl border border-border bg-card px-4 py-4">
            <SectionTitle>Pricing</SectionTitle>
            <DetailRow label="Price" value={`${priceText} Ft`} />
            <DetailRow
              label="Discounted price"
              value={hasDiscountedPrice ? `${discountedPriceText} Ft` : "Not set"}
            />
          </View>

          <View className="rounded-2xl border border-border bg-card px-4 py-4">
            <SectionTitle>Owner</SectionTitle>
            <View className="flex-row items-center gap-3">
              <Avatar alt={owner?.name ?? "Owner"} className="size-12">
                <AvatarImage source={{ uri: owner?.image ?? undefined }} />
                <AvatarFallback>
                  <Text className="text-sm font-semibold">
                    {owner?.name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {owner?.name ?? "Unknown owner"}
                </Text>
              </View>
            </View>
          </View>

          {chatError ? (
            <Text className="text-sm text-destructive">{chatError}</Text>
          ) : null}

          <Button
            onPress={openChat}
            disabled={isStartingChat || isOwner || !owner}
            className="w-full"
          >
            <Text>
              {isOwner
                ? "You own this listing"
                : isStartingChat
                  ? "Starting chat..."
                  : "Message owner"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}