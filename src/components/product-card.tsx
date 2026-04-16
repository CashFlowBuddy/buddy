import React from "react";
import {
  Card,
  CardDescription,
  CardTitle,
} from "./ui/card";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Image, Pressable, View, useWindowDimensions } from "react-native";
import { Text } from "./ui/text";
import { Icon } from "./ui/icon";
import { Heart, Store, type LucideIcon } from "lucide-react-native";

export const NO_IMAGE_SENTINEL = "__NO_IMAGE__";

interface ProductCardProps {
  title: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  favourite: boolean;
  showFavouriteAction?: boolean;
  isFavouriteLoading?: boolean;
  isCardActionLoading?: boolean;
  uid: string;
  onToggleFavourite?: (id: string, currentValue: boolean) => void;
  onCardActionPress?: () => void;
  cardActionIcon?: LucideIcon;
  onCarouselTouchStart?: () => void;
  onCarouselTouchEnd?: () => void;
  onPress?: () => void;
  className?: string;
}

function ProductCard({
  title,
  price,
  discountedPrice,
  images,
  favourite,
  showFavouriteAction = true,
  isFavouriteLoading = false,
  isCardActionLoading = false,
  uid,
  onToggleFavourite,
  onCardActionPress,
  cardActionIcon,
  onCarouselTouchStart,
  onCarouselTouchEnd,
  onPress,
  className,
  ...CardProps
}: ProductCardProps) {
  const ref = React.useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { width } = useWindowDimensions();

  const formatHuf = React.useCallback((value: number) => {
    return new Intl.NumberFormat("hu-HU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const hasDiscount =
    typeof discountedPrice === "number" &&
    Number.isFinite(discountedPrice) &&
    discountedPrice >= 0 &&
    discountedPrice < price;

  const displayPrice = hasDiscount ? discountedPrice : price;
  const discountPercent =
    hasDiscount && price > 0
      ? Math.round(((price - discountedPrice) / price) * 100)
      : 0;

  const imageSize = Math.min(132, Math.max(100, width * 0.28));

  return (
    <Card className={"flex-row overflow-hidden py-0 " + className} {...CardProps}>
      <View className="relative">
        <Carousel
          ref={ref}
          loop
          width={imageSize}
          height={imageSize}
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
                  width: imageSize,
                  height: imageSize,
                }}
                resizeMode="cover"
              />
            );
          }}
        />

          {showFavouriteAction ? (
            <Pressable
              className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/40"
              onPress={() => onToggleFavourite?.(uid, favourite)}
              disabled={isFavouriteLoading}
              hitSlop={8}
            >
              <Icon
                as={Heart}
                className={favourite ? "text-red-500" : "text-white"}
                size={18}
                fill={favourite ? "currentColor" : "none"}
              />
            </Pressable>
          ) : null}

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
      </View>

      <View className="flex-1 justify-center px-4 py-3">
        {onCardActionPress && cardActionIcon ? (
          <View className="mb-2 flex-row justify-end">
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full border border-border bg-background"
              onPress={onCardActionPress}
              disabled={isCardActionLoading}
              hitSlop={8}
            >
              <Icon as={cardActionIcon} className="text-foreground" size={16} />
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={onPress} disabled={!onPress} className="w-full">
          <CardTitle className="w-full p-0">
            <Text numberOfLines={2} className="mb-1 text-base font-medium">
              {title}
            </Text>
          </CardTitle>
          <CardDescription className="w-full p-0">
            {hasDiscount ? (
              <View>
                <Text numberOfLines={1} className="text-xs text-muted-foreground line-through">
                  {formatHuf(price)}{"\u00A0"}Ft
                </Text>
                <View className="mt-0.5 flex-row items-end gap-2">
                  <View className="flex-row items-end gap-1">
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.92}
                      className="text-lg font-bold text-primary"
                    >
                      {formatHuf(displayPrice)}
                    </Text>
                    <Text className="pb-0.5 text-xs font-semibold text-primary">Ft</Text>
                  </View>
                  <View className="rounded-full bg-red-500/10 px-2 py-0.5">
                    <Text className="text-xs font-semibold text-red-500">
                      -{discountPercent}%
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-row items-end gap-1">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.92}
                  className="text-lg font-bold text-primary"
                >
                  {formatHuf(displayPrice)}
                </Text>
                <Text className="pb-0.5 text-xs font-semibold text-primary">Ft</Text>
              </View>
            )}
          </CardDescription>
        </Pressable>
      </View>
    </Card>
  );
}

const MemoizedProductCard = React.memo(ProductCard);

export { MemoizedProductCard as ProductCard };
