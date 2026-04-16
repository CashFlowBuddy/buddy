import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { authClient, getAuthCookieHeader } from "@/lib/auth-client";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, View } from "react-native";

type SelectedImage = {
  uri: string;
  name?: string;
  mimeType?: string;
};

const IMAGE_BASE_URL = "https://cash.saserver.hu";

function resolvePreviewUri(uri?: string | null) {
  if (!uri) return undefined;

  if (
    uri.startsWith("http://") ||
    uri.startsWith("https://") ||
    uri.startsWith("file://") ||
    uri.startsWith("data:") ||
    uri.startsWith("content:")
  ) {
    return uri;
  }

  if (uri.startsWith("/")) {
    return `${IMAGE_BASE_URL}${uri}`;
  }

  return `${IMAGE_BASE_URL}/${uri}`;
}

export default function AccSetDial() {
  const { data: session, refetch } = authClient.useSession();
  const currentUser = session?.user;

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(currentUser?.name ?? "");
  const [selectedImage, setSelectedImage] = React.useState<SelectedImage | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPickingImage, setIsPickingImage] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setName(currentUser?.name ?? "");
    setSelectedImage(null);
    setError(null);
  }, [currentUser?.image, currentUser?.name, open]);

  const imagePreview = selectedImage?.uri ?? currentUser?.image ?? "";
  const hasImagePreview = Boolean(imagePreview);
  const resolvedPreviewUri = resolvePreviewUri(imagePreview);

  const pickImage = async () => {
    setError(null);
    setIsPickingImage(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to upload a profile image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split("/").pop() ?? "avatar.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    } catch (pickError) {
      console.error("Error picking image:", pickError);
      setError("Unable to pick an image.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSave = async () => {
    const userId = currentUser?.id;

    if (!userId) {
      setError("You need to be signed in to update your account.");
      return;
    }

    const nextName = name.trim();

    if (!nextName) {
      setError("Name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const cookieHeader = await getAuthCookieHeader();

      if (selectedImage) {
        const uploadFormData = new FormData();
        uploadFormData.append(
          "file",
          {
            uri: selectedImage.uri,
            name: selectedImage.name ?? "avatar.jpg",
            type: selectedImage.mimeType ?? "image/jpeg",
          } as unknown as Blob,
        );

        const uploadResponse = await fetch(
          `https://api.saserver.hu/api/users/${userId}/avatar`,
          {
            method: "POST",
            headers: {
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            credentials: "include",
            body: uploadFormData,
          },
        );

        if (!uploadResponse.ok) {
          const message = await uploadResponse.text();
          throw new Error(
            message || `Failed to upload avatar. Status: ${uploadResponse.status}`,
          );
        }
      }

      const updateResponse = await fetch(
        `https://api.saserver.hu/api/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            name: nextName,
          }),
        },
      );

      if (!updateResponse.ok) {
        const message = await updateResponse.text();
        throw new Error(
          message || `Failed to update account. Status: ${updateResponse.status}`,
        );
      }

      await refetch();
      setOpen(false);
    } catch (updateError) {
      console.error("Error updating account:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update account.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Text>Account Settings</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[420px] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Update the name and upload a new profile image.
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <Avatar alt={currentUser?.name || "User"} className="size-14">
              <AvatarImage source={{ uri: resolvedPreviewUri }} />
              <AvatarFallback>
                <Text>{(name || currentUser?.name || "U")[0]?.toUpperCase()}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-sm text-muted-foreground">
                Preview
              </Text>
              <Text className="text-base font-medium text-foreground">
                {name.trim() || currentUser?.name || "Your name"}
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Name</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Profile image</Text>
            <Pressable
              onPress={pickImage}
              disabled={isPickingImage || isSaving}
              className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="size-12 items-center justify-center overflow-hidden rounded-full bg-background border border-border">
                  {hasImagePreview ? (
                    <Image
                      source={{ uri: resolvedPreviewUri }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-sm font-semibold text-muted-foreground">
                      {name.trim()?.[0]?.toUpperCase() || currentUser?.name?.[0]?.toUpperCase() || "U"}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {isPickingImage
                      ? "Picking image..."
                      : hasImagePreview
                        ? "Change image"
                        : "Choose image"}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    JPG, PNG, or WebP. The selected file will be uploaded.
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>

          {error ? <Text className="text-sm text-destructive">{error}</Text> : null}

          <View className="flex-row gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setOpen(false)}
              disabled={isSaving}
            >
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleSave} disabled={isSaving}>
              <Text>{isSaving ? "Saving..." : "Save changes"}</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
