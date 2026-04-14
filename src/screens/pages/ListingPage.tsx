import React, { memo, useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/search-bar";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { NO_IMAGE_SENTINEL, ProductCard } from "@/components/product-card";
import { getAuthCookieHeader } from "@/lib/auth-client";
import type { Listing } from "@/lib/interfaces";

type HomePageProps = {
  setPagerScrollEnabled?: (enabled: boolean) => void;
  mode?: "all" | "saved";
};

type ListingItemProps = {
  item: Listing;
  isFavourite: boolean;
  isFavouriteLoading: boolean;
  setPagerScrollEnabled?: (enabled: boolean) => void;
  onToggleFavourite: (listingId: string, currentlySaved: boolean) => void;
};

const ListingItem = memo(function ListingItem({
  item,
  isFavourite,
  isFavouriteLoading,
  setPagerScrollEnabled,
  onToggleFavourite,
}: ListingItemProps) {
  return (
    <ProductCard
      className="flex-1"
      title={item.title}
      price={item.price ?? 0}
      images={
        item.pictures && item.pictures.length > 0
          ? item.pictures.map((p) => "https://cash.saserver.hu" + p.url)
          : [NO_IMAGE_SENTINEL]
      }
      favourite={isFavourite}
      isFavouriteLoading={isFavouriteLoading}
      uid={item.id}
      onToggleFavourite={onToggleFavourite}
      onCarouselTouchStart={() => setPagerScrollEnabled?.(false)}
      onCarouselTouchEnd={() => setPagerScrollEnabled?.(true)}
    />
  );
});

export default function HomePage({
  setPagerScrollEnabled,
  mode = "all",
}: HomePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [allDATA, setAllData] = useState<Listing[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [pendingSaveIds, setPendingSaveIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      setPagerScrollEnabled?.(true);
    };
  }, [setPagerScrollEnabled]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cookieHeader = await getAuthCookieHeader();

      if (mode === "saved") {
        const savedResponse = await fetch(
          "https://api.saserver.hu/api/listings/saved",
          {
            headers: {
              "Content-Type": "application/json",
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            credentials: "include",
          },
        );

        if (!savedResponse.ok) {
          throw new Error(`HTTP error! status: ${savedResponse.status}`);
        }

        const savedData = await savedResponse.json();
        const listings = Array.isArray(savedData) ? savedData : [];
        const ids = listings
          .map((listing: Listing) => listing.id)
          .filter((id): id is string => Boolean(id));

        setAllData(listings);
        setSavedListingIds(new Set(ids));
        return;
      }

      const [listingsResponse, savedResponse] = await Promise.all([
        fetch("https://api.saserver.hu/api/listings", {
          headers: { "Content-Type": "application/json" },
        }),
        fetch("https://api.saserver.hu/api/listings/saved", {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          credentials: "include",
        }),
      ]);

      if (!listingsResponse.ok) {
        throw new Error(`HTTP error! status: ${listingsResponse.status}`);
      }

      const data = await listingsResponse.json();
      setAllData(Array.isArray(data) ? data : []);

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        const ids = Array.isArray(savedData)
          ? savedData
              .map((listing: Listing) => listing.id)
              .filter((id): id is string => Boolean(id))
          : [];

        setSavedListingIds(new Set(ids));
      } else {
        setSavedListingIds(new Set());
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings");
      setAllData([]);
      setSavedListingIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveListing = useCallback(
    async (listingId: string, currentlySaved: boolean) => {
      let canProceed = false;

      setPendingSaveIds((prev) => {
        if (prev.has(listingId)) {
          return prev;
        }

        canProceed = true;
        const next = new Set(prev);
        next.add(listingId);
        return next;
      });

      if (!canProceed) return;

      setSavedListingIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });

      try {
        const cookieHeader = await getAuthCookieHeader();
        const endpoint = `https://api.saserver.hu/api/listings/${listingId}/save`;

        const response = await fetch(endpoint, {
          method: currentlySaved ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error toggling saved listing:", err);

        setSavedListingIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) {
            next.add(listingId);
          } else {
            next.delete(listingId);
          }
          return next;
        });
      } finally {
        setPendingSaveIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      }
    },
    [],
  );

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };

  const filteredDATA = allDATA.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingItem
        item={item}
        isFavourite={savedListingIds.has(item.id)}
        isFavouriteLoading={pendingSaveIds.has(item.id)}
        setPagerScrollEnabled={setPagerScrollEnabled}
        onToggleFavourite={toggleSaveListing}
      />
    ),
    [pendingSaveIds, savedListingIds, setPagerScrollEnabled, toggleSaveListing],
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => setSearchValue("")}
        />
        {error ? (
          <Text className="mt-2 text-center text-red-500">{error}</Text>
        ) : null}
      </View>
      {isLoading ? (
        <View className="p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} className="flex flex-row items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="gap-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredDATA}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 8 }}
          className="px-6"
          contentContainerStyle={{ gap: 8 }}
          ListEmptyComponent={() => (
            <View className="p-4">
              <Text className="text-center text-gray-500">
                {mode === "saved" ? "No saved items found" : "No items found"}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
