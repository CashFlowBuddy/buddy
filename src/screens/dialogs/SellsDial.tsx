import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ScrollView, View } from "react-native";
import { useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/ui/select";
import { getAuthCookieHeader } from "@/lib/auth-client";
import { ImgUpload } from "@/components/ui/img-upload";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const categories = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FASHION", label: "Fashion" },
  { value: "HOME", label: "Home" },
  { value: "BOOKS", label: "Books" },
  { value: "TOYS", label: "Toys" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
];

export default function SellsDial() {
  const [feedback, setFeedback] = useState<{
    variant: "default" | "destructive";
    title: string;
    message: string;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setPrice("");
    setSelectedImages([]);
  };

  const createListing = async (cookieHeader: string | null, parsedPrice: number) => {
    const response = await fetch("https://api.saserver.hu/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
        price: parsedPrice,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Listing creation failed with status ${response.status}`);
    }

    const createdListing = await response.json();
    const listingId = createdListing?.id as string | undefined;

    if (!listingId) {
      throw new Error("Listing created but no listing id was returned.");
    }

    return listingId;
  };

  const uploadListingPicture = async (cookieHeader: string | null, listingId: string, imageUri: string) => {
    const mimeType = getMimeTypeFromImage(imageUri);
    const fileName = getFileNameFromImage(imageUri);

    const formData = new FormData();
    formData.append("listingId", listingId);

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

    const response = await fetch("https://api.saserver.hu/api/pictures", {
      method: "POST",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Image upload failed with status ${response.status}`);
    }
  };

  const handleSubmit = async () => {
    setFeedback(null);
    const parsedPrice = Number(price);

    if (!title.trim()) {
      setFeedback({
        variant: "destructive",
        title: "Missing field",
        message: "Title is required.",
      });
      return;
    }

    if (!description.trim()) {
      setFeedback({
        variant: "destructive",
        title: "Missing field",
        message: "Description is required.",
      });
      return;
    }

    if (!category) {
      setFeedback({
        variant: "destructive",
        title: "Missing field",
        message: "Category is required.",
      });
      return;
    }

    if (!selectedImages.length) {
      setFeedback({
        variant: "destructive",
        title: "Missing image",
        message: "Please upload at least one image before submitting.",
      });
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFeedback({
        variant: "destructive",
        title: "Invalid price",
        message: "Price must be a valid number greater than 0.",
      });
      return;
    }


    setIsSubmitting(true);

    try {
      const cookieHeader = await getAuthCookieHeader();

      const listingId = await createListing(cookieHeader, parsedPrice);

      for (const imageUri of selectedImages.slice(0, 6)) {
        await uploadListingPicture(cookieHeader, listingId, imageUri);
      }

      setFeedback({
        variant: "default",
        title: "Upload successful",
        message: "Listing and pictures uploaded successfully.",
      });
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create listing.";
      setFeedback({
        variant: "destructive",
        title: "Upload failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Text>Sells</Text>
        </Button>
      </DialogTrigger>

      <DialogContent className="z-50 w-full h-full">
        <DialogHeader>
          <DialogTitle>Sell product</DialogTitle>
        </DialogHeader>

        <ScrollView
          className="flex-1"
          contentContainerClassName="py-4 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Label>Title</Label>
          <Input
            placeholder="Enter title"
            className="mb-4"
            value={title}
            onChangeText={setTitle}
          />

          <Label>Description</Label>
          <Input
            placeholder="Enter description"
            className="mb-4"
            value={description}
            onChangeText={setDescription}
          />

          <Label>Category</Label>
          <AppSelect
            value={category}
            onValueChange={setCategory}
            options={categories}
            placeholder="Select category"
          />

          <Label>Price</Label>
          <Input placeholder="Enter price" className="mb-4" keyboardType="numeric" value={price} onChangeText={setPrice} />

          <Label>Upload Images</Label>
          <ImgUpload onImagesSelect={setSelectedImages} disabled={isSubmitting} />

          {feedback ? (
            <Alert
              className="mt-4"
              variant={feedback.variant}
              icon={feedback.variant === "destructive" ? CircleAlert : CircleCheck}
            >
              <AlertTitle>{feedback.title}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="mt-4 w-full" onPress={handleSubmit} disabled={isSubmitting}>
            <Text>{isSubmitting ? "Submitting..." : "Submit"}</Text>
          </Button>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}