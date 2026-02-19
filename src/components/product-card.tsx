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
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: cardWidth,
                height: cardWidth,
              }}
              resizeMode="cover"
            />
          )}
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
