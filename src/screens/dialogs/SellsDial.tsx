import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { View } from "react-native";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/ui/select";
import { getAuthCookieHeader } from "@/lib/auth-client";
import { ImgUpload } from "@/components/ui/img-upload";

const categories = [
  { value: "ELECTRONIC", label: "Electronics" },
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

export default function SellsDial() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setPrice("");
    setDiscount("");
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const parsedPrice = Number(price);
    const parsedDiscount = discount.trim() ? Number(discount) : undefined;

    if (!title.trim()) {
      setSubmitError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setSubmitError("Description is required.");
      return;
    }

    if (!category) {
      setSubmitError("Category is required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setSubmitError("Price must be a valid number greater than 0.");
      return;
    }

    if (parsedDiscount !== undefined && (!Number.isFinite(parsedDiscount) || parsedDiscount < 0)) {
      setSubmitError("Discounted price must be a valid number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cookieHeader = await getAuthCookieHeader();

      const response = await fetch("https://api.saserver.hu/api/listing", {
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
          ...(parsedDiscount !== undefined ? { discountedPrice: parsedDiscount } : {}),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      setSubmitSuccess("Listing created successfully.");
      resetForm();
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create listing.";
      setSubmitError(errorMessage);
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

        <View className="py-4">
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

          <Label>Upload Image</Label>
          <ImgUpload onImageSelect={setSelectedImage} />

          {submitError ? <Text className="mb-3 text-destructive">{submitError}</Text> : null}
          {submitSuccess ? <Text className="mb-3 text-green-600">{submitSuccess}</Text> : null}

          <Button className="mt-4 w-full" onPress={handleSubmit} disabled={isSubmitting}>
            <Text>{isSubmitting ? "Submitting..." : "Submit"}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}