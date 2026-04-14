import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/search-bar";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { NO_IMAGE_SENTINEL, ProductCard } from "@/components/product-card";
import type { Listing } from "@/lib/interfaces";

type HomePageProps = {
  setPagerScrollEnabled?: (enabled: boolean) => void;
};

export default function HomePage({ setPagerScrollEnabled }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [allDATA, setAllData] = useState<Listing[]>([]);

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

      const response = await fetch("https://api.saserver.hu/api/listings", {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings");
      setAllData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };

  const filteredDATA = allDATA.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const Item = ({ item }: { item: Listing }) => (
    <ProductCard
      className="flex-1"
      title={item.title}
      price={item.price ?? 0}
      images={
        item.pictures && item.pictures.length > 0
          ? item.pictures.map((p) => "https://cash.saserver.hu" + p.url)
          : [NO_IMAGE_SENTINEL]
      }
      favourite={false}
      uid={item.id}
      onCarouselTouchStart={() => setPagerScrollEnabled?.(false)}
      onCarouselTouchEnd={() => setPagerScrollEnabled?.(true)}
    />
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => setSearchValue("")}
        />
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
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 8 }}
          className="px-6"
          contentContainerStyle={{ gap: 8 }}
          ListEmptyComponent={() => (
            <View className="p-4">
              <Text className="text-center text-gray-500">No items found</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
