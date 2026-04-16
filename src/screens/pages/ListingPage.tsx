import React, { memo, useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/search-bar";
import { AppSelect } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SquarePen, Trash2 } from "lucide-react-native";
import { ImgUpload } from "@/components/ui/img-upload";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NO_IMAGE_SENTINEL, ProductCard } from "@/components/product-card";
import { getAuthCookieHeader } from "@/lib/auth-client";
import type { Listing } from "@/lib/interfaces";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppNavigation";

const categoryOptions = [
  { value: "ALL", label: "All categories" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FASHION", label: "Fashion" },
  { value: "HOME", label: "Home" },
  { value: "BOOKS", label: "Books" },
  { value: "TOYS", label: "Toys" },
  { value: "SPORTS", label: "Sports" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "GARDEN", label: "Garden" },
  { value: "OTHER", label: "Other" },
];

type HomePageProps = {
  setPagerScrollEnabled?: (enabled: boolean) => void;
  mode?: "all" | "saved" | "mine";
};

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type ListingItemProps = {
  item: Listing;
  mode: "all" | "saved" | "mine";
  isFavourite: boolean;
  isFavouriteLoading: boolean;
  setPagerScrollEnabled?: (enabled: boolean) => void;
  onToggleFavourite: (listingId: string, currentlySaved: boolean) => void;
  onEditPress?: (listing: Listing) => void;
  onPress?: () => void;
};

const ListingItem = memo(function ListingItem({
  item,
  mode,
  isFavourite,
  isFavouriteLoading,
  setPagerScrollEnabled,
  onToggleFavourite,
  onEditPress,
  onPress,
}: ListingItemProps) {
  return (
    <View className="w-full">
      <ProductCard
        className="w-full"
        title={item.title}
        price={item.price ?? 0}
        discountedPrice={item.discountedPrice}
        images={
          item.pictures && item.pictures.length > 0
            ? item.pictures.map((p) => "https://cash.saserver.hu" + p.url)
            : [NO_IMAGE_SENTINEL]
        }
        favourite={isFavourite}
        showFavouriteAction={mode !== "mine"}
        isFavouriteLoading={isFavouriteLoading}
        cardActionIcon={mode === "mine" ? SquarePen : undefined}
        onCardActionPress={mode === "mine" ? () => onEditPress?.(item) : undefined}
        uid={item.id}
        onToggleFavourite={onToggleFavourite}
        onCarouselTouchStart={() => setPagerScrollEnabled?.(false)}
        onCarouselTouchEnd={() => setPagerScrollEnabled?.(true)}
        onPress={onPress}
      />
    </View>
  );
});

export default function HomePage({
  setPagerScrollEnabled,
  mode = "all",
}: HomePageProps) {
  const navigation = useNavigation<NavigationProp>();
  const MAX_LISTING_IMAGES = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [allDATA, setAllData] = useState<Listing[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [pendingSaveIds, setPendingSaveIds] = useState<Set<string>>(new Set());
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("OTHER");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [existingPictures, setExistingPictures] = useState<
    Array<{ id: string; url: string }>
  >([]);
  const [removedPictureIds, setRemovedPictureIds] = useState<string[]>([]);
  const [newPictureUris, setNewPictureUris] = useState<string[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

      if (mode === "mine") {
        const myResponse = await fetch("https://api.saserver.hu/api/listings/my", {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          credentials: "include",
        });

        if (!myResponse.ok) {
          throw new Error(`HTTP error! status: ${myResponse.status}`);
        }

        const myData = await myResponse.json();
        const listings = Array.isArray(myData) ? myData : [];

        setAllData(listings);
        setSavedListingIds(new Set());
        return;
      }

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

  const openEditDialog = useCallback((listing: Listing) => {
    setEditingListing(listing);
    setEditTitle(listing.title ?? "");
    setEditDescription(listing.description ?? "");
    setEditCategory(listing.category ?? "OTHER");
    setEditPrice(typeof listing.price === "number" ? String(listing.price) : "");
    setEditDiscountPrice(
      typeof listing.discountedPrice === "number"
        ? String(listing.discountedPrice)
        : "",
    );
    setExistingPictures(
      (listing.pictures ?? [])
        .filter((picture) => Boolean(picture.id && picture.url))
        .map((picture) => ({ id: picture.id, url: picture.url })),
    );
    setRemovedPictureIds([]);
    setNewPictureUris([]);
    setEditError(null);
  }, []);

  const closeEditDialog = useCallback(() => {
    if (isSubmittingEdit) return;
    setEditingListing(null);
    setExistingPictures([]);
    setRemovedPictureIds([]);
    setNewPictureUris([]);
    setEditError(null);
  }, [isSubmittingEdit]);

  const getMimeTypeFromImage = (imageUri: string) => {
    if (imageUri.startsWith("data:")) {
      const match = imageUri.match(/^data:(.*?);/);
      return match?.[1] ?? "image/jpeg";
    }

    const extension = imageUri.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "jpg":
      case "jpeg":
      default:
        return "image/jpeg";
    }
  };

  const getFileNameFromImage = (imageUri: string) => {
    const pathFileName = imageUri.split("/").pop();
    if (pathFileName && !pathFileName.startsWith("data:")) {
      return pathFileName;
    }

    const mimeType = getMimeTypeFromImage(imageUri);
    const extension = mimeType.split("/")[1] || "jpg";
    return `listing-image.${extension}`;
  };

  const removeExistingPicture = useCallback((pictureId: string) => {
    setExistingPictures((prev) => prev.filter((picture) => picture.id !== pictureId));
    setRemovedPictureIds((prev) =>
      prev.includes(pictureId) ? prev : [...prev, pictureId],
    );
  }, []);

  const remainingImageSlots = Math.max(
    0,
    MAX_LISTING_IMAGES - existingPictures.length,
  );

  const submitListingUpdate = useCallback(async () => {
    if (!editingListing) return;

    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }

    if (!editDescription.trim()) {
      setEditError("Description is required.");
      return;
    }

    const parsedPrice = Number(editPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setEditError("Price must be a valid number greater than 0.");
      return;
    }

    const parsedDiscount = editDiscountPrice.trim()
      ? Number(editDiscountPrice)
      : undefined;

    if (
      parsedDiscount !== undefined &&
      (!Number.isFinite(parsedDiscount) || parsedDiscount < 0)
    ) {
      setEditError("Discounted price must be a valid number.");
      return;
    }

    if (existingPictures.length + newPictureUris.length > MAX_LISTING_IMAGES) {
      setEditError(`You can have at most ${MAX_LISTING_IMAGES} images per listing.`);
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      price: parsedPrice,
      ...(parsedDiscount !== undefined ? { discountedPrice: parsedDiscount } : {}),
    };

    try {
      const cookieHeader = await getAuthCookieHeader();
      const endpoint = `https://api.saserver.hu/api/listings/${editingListing.id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Failed to update listing. Status: ${response.status}`,
        );
      }

      const updated = (await response.json()) as Listing;

      if (removedPictureIds.length) {
        await Promise.all(
          removedPictureIds.map(async (pictureId) => {
            const deleteResponse = await fetch(
              `https://api.saserver.hu/api/pictures/${pictureId}`,
              {
                method: "DELETE",
                headers: {
                  ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                },
                credentials: "include",
              },
            );

            if (!deleteResponse.ok) {
              const message = await deleteResponse.text();
              throw new Error(
                message ||
                  `Failed to delete picture. Status: ${deleteResponse.status}`,
              );
            }
          }),
        );
      }

      if (newPictureUris.length) {
        await Promise.all(
          newPictureUris.slice(0, remainingImageSlots).map(async (imageUri) => {
            const mimeType = getMimeTypeFromImage(imageUri);
            const fileName = getFileNameFromImage(imageUri);
            const formData = new FormData();
            formData.append("listingId", editingListing.id);

            if (imageUri.startsWith("data:")) {
              const imageBlob = await fetch(imageUri).then((res) => res.blob());
              formData.append("file", imageBlob, fileName);
            } else {
              formData.append("file", {
                uri: imageUri,
                name: fileName,
                type: mimeType,
              } as unknown as Blob);
            }

            const uploadResponse = await fetch(
              "https://api.saserver.hu/api/pictures",
              {
                method: "POST",
                headers: {
                  ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                },
                credentials: "include",
                body: formData,
              },
            );

            if (!uploadResponse.ok) {
              const message = await uploadResponse.text();
              throw new Error(
                message ||
                  `Failed to upload picture. Status: ${uploadResponse.status}`,
              );
            }
          }),
        );
      }

      setAllData((prev) =>
        prev.map((item) =>
          item.id === editingListing.id
            ? {
                ...item,
                ...updated,
                title: updated.title ?? payload.title,
                description: updated.description ?? payload.description,
                category: updated.category ?? payload.category,
                price: updated.price ?? payload.price,
                discountedPrice:
                  updated.discountedPrice ?? payload.discountedPrice,
              }
            : item,
        ),
      );

      await fetchListings();
      closeEditDialog();
    } catch (err) {
      console.error("Error updating listing:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update listing.",
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [
    editCategory,
    closeEditDialog,
    editDescription,
    editDiscountPrice,
    editingListing,
    existingPictures.length,
    editPrice,
    editTitle,
    fetchListings,
    remainingImageSlots,
    newPictureUris,
    removedPictureIds,
  ]);

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };

  const filteredDATA = allDATA.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingItem
        item={item}
        mode={mode}
        isFavourite={savedListingIds.has(item.id)}
        isFavouriteLoading={pendingSaveIds.has(item.id)}
        setPagerScrollEnabled={setPagerScrollEnabled}
        onToggleFavourite={toggleSaveListing}
        onEditPress={openEditDialog}
        onPress={() => navigation.navigate("ListingDetail", { listing: item })}
      />
    ),
    [
      mode,
      openEditDialog,
      navigation,
      pendingSaveIds,
      savedListingIds,
      setPagerScrollEnabled,
      toggleSaveListing,
    ],
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 pb-4">
        <AppSelect
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          options={categoryOptions}
          placeholder="Filter by category"
        />
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
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          className="px-6"
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          ListEmptyComponent={() => (
            <View className="p-4">
              <Text className="text-center text-gray-500">
                {mode === "saved"
                  ? "No saved items found"
                  : mode === "mine"
                    ? "No listings found"
                    : "No items found"}
              </Text>
            </View>
          )}
        />
      )}

      <Dialog
        open={Boolean(editingListing)}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent className="max-w-[95%]">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
          </DialogHeader>

          <ScrollView
            className="max-h-[80vh]"
            contentContainerClassName="gap-3 pb-2"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-1">
              <Label>Title</Label>
              <Input
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter title"
              />
            </View>

            <View className="gap-1">
              <Label>Description</Label>
              <Input
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Enter description"
              />
            </View>

            <View className="gap-1">
              <Label>Category</Label>
              <AppSelect
                value={editCategory}
                onValueChange={setEditCategory}
                options={categoryOptions}
                placeholder="Select category"
              />
            </View>

            <View className="gap-1">
              <Label>Price</Label>
              <Input
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            </View>

            <View className="gap-1">
              <Label>Discounted price</Label>
              <Input
                value={editDiscountPrice}
                onChangeText={setEditDiscountPrice}
                placeholder="Optional discounted price"
                keyboardType="numeric"
              />
            </View>

            <View className="gap-1">
              <Label>Current pictures</Label>
              {existingPictures.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {existingPictures.map((picture) => {
                    const uri = picture.url.startsWith("http")
                      ? picture.url
                      : `https://cash.saserver.hu${picture.url}`;

                    return (
                      <View
                        key={picture.id}
                        className="relative h-20 w-20 overflow-hidden rounded-md border border-border"
                      >
                        <Image
                          source={{ uri }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                        <Pressable
                          className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/65"
                          onPress={() => removeExistingPicture(picture.id)}
                          disabled={isSubmittingEdit}
                          hitSlop={8}
                        >
                          <Icon as={Trash2} size={14} className="text-white" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="text-sm text-muted-foreground">
                  No pictures currently attached.
                </Text>
              )}
            </View>

            <View className="gap-1">
              <Label>Add new pictures</Label>
              <ImgUpload
                key={`img-upload-${remainingImageSlots}`}
                onImagesSelect={setNewPictureUris}
                maxImages={remainingImageSlots}
                disabled={isSubmittingEdit}
                className="mt-1"
              />
              <Text className="text-xs text-muted-foreground">
                {existingPictures.length} / {MAX_LISTING_IMAGES} current images. {remainingImageSlots} slot(s) available.
              </Text>
              {newPictureUris.length ? (
                <Text className="text-xs text-muted-foreground">
                  {newPictureUris.length} new image(s) selected for upload.
                </Text>
              ) : null}
            </View>

            {editError ? (
              <Text className="text-sm text-red-500">{editError}</Text>
            ) : null}

            <View className="flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onPress={closeEditDialog}
                disabled={isSubmittingEdit}
              >
                <Text>Cancel</Text>
              </Button>
              <Button onPress={submitListingUpdate} disabled={isSubmittingEdit}>
                <Text>{isSubmittingEdit ? "Saving..." : "Save changes"}</Text>
              </Button>
            </View>
          </ScrollView>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
