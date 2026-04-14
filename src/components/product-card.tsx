import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Dimensions, Image, View } from "react-native";
import { Text } from "./ui/text";
import { Icon } from "./ui/icon";
import { Store } from "lucide-react-native";

export const NO_IMAGE_SENTINEL = "__NO_IMAGE__";

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
  const ref = React.useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({ index, animated: true });
  };

  const width = Dimensions.get("window").width;
  const cardWidth = (width - 48) / 2 - 4;

  return (
    <Card
      className={"items-center py-0 overflow-hidden " + className}
      {...CardProps}
    >
      <CardHeader className="w-full p-0 relative overflow-hidden rounded-t-xl">
        <Carousel
          ref={ref}
          loop
          width={cardWidth}
          height={cardWidth}
          autoPlay={false}
          data={images}
          scrollAnimationDuration={300}
          onProgressChange={(_, absoluteProgress) => {
            const nextIndex = Math.round(absoluteProgress) % images.length;
            setActiveIndex(nextIndex);
          }}
          onScrollStart={onCarouselTouchStart}
          onScrollEnd={() => onCarouselTouchEnd?.()}
          renderItem={({ item }) => {
            if (item === NO_IMAGE_SENTINEL) {
              return (
                <View className="h-full w-full rounded-xl border bg-muted p-2">
                  <View className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <View className="flex flex-row items-center justify-center gap-1 text-primary">
                      <Icon as={Store} className="size-5 text-primary" />
                      <Text
                        numberOfLines={1}
                        className="text-sm font-semibold text-primary"
                      >
                        CashFlowBuddy
                      </Text>
                    </View>
                    <Text className="mt-1 text-sm text-muted-foreground">
                      No image
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <Image
                source={{ uri: item }}
                style={{
                  width: cardWidth,
                  height: cardWidth,
                }}
                resizeMode="contain"
              />
            );
          }}
        />

        {images.length > 1 && (
          <View className="absolute bottom-3 w-full items-center">
            <View style={{ flexDirection: "row", gap: 6 }}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor:
                      index === activeIndex
                        ? "#fff"
                        : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </CardHeader>
      <CardTitle className="w-full px-4">
        <Text numberOfLines={2} className="text-base font-medium mb-1">
          {title}
        </Text>
      </CardTitle>
      <CardDescription className="w-full px-4 pb-4">
        <Text className="text-sm font-semibold text-primary">
          ${price.toFixed(2)}
        </Text>
      </CardDescription>
    </Card>
  );
}

export { ProductCard };
