import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/search-bar";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [allDATA, setAllData] = useState<any[]>([]); // This should be replaced with actual data fetching logic

  useEffect(() => {
    // Simulate data fetching
    setIsLoading(true);
    setTimeout(() => {
        // TODO: Replace with actual data and implement search functionality
      const mockData = Array.from({ length: 5000 }, (_, i) => ({
        id: String(i + 1),
        title: `Item ${i + 1}`,
      }));
      setAllData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };


  const filteredDATA = allDATA.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

    // TODO: Replace with actual item component
  const Item = ({ item }: { item: any }) => (
    <View className="p-4 border-b border-gray-200">
      <Text className="text-lg">{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4">
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
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={(item) => item.id}
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
