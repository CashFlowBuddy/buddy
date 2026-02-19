import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Carousel from "react-native-reanimated-carousel";
import { Dimensions, Image } from "react-native";
import { AspectRatio } from "./ui/aspect-ratio";
import { Text } from "./ui/text";

interface ProductCardProps {
  title: string;
  price: number;
  images: string[];
  favourite: boolean;
  uid: string;
  onCarouselTouchStart?: () => void;
  onCarouselTouchEnd?: () => void;
  className?: string;
}

function ProductCard({
  title,
  price,
  images,
  favourite,
  uid,
  onCarouselTouchStart,
  onCarouselTouchEnd,
  className,
  ...CardProps
}: ProductCardProps) {
  const width = Dimensions.get("window").width;
  return (
    <Card className={`items-center pt-0 ${className}`} {...CardProps}>
      <CardHeader className="w-full p-0">
        <Carousel
          loop
          width={width * 0.4}
          height={width * 0.4 * (1)}
          autoPlay={false}
          data={images}
          scrollAnimationDuration={300}
          onScrollStart={onCarouselTouchStart}
          onScrollEnd={() => onCarouselTouchEnd?.()}
          renderItem={({ item }) => (
            <AspectRatio
              ratio={1}
              className="relative aspect-video w-full overflow-hidden rounded-t-xl"
            >
              <Image
                className="absolute bottom-0 left-0 right-0 top-0 object-cover"
                source={{ uri: item }}
              />
            </AspectRatio>
          )}
        />
      </CardHeader>
      <CardContent className="w-full pt-0">
        <Text className="text-lg font-semibold">{title}</Text>
      </CardContent>
      <CardFooter className="w-full">
        <Text className="text-sm text-muted-foreground">${price.toFixed(2)}</Text>
      </CardFooter>
    </Card>
  );
}

export { ProductCard };
