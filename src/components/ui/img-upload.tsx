import { cn } from '@/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Platform, Pressable, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import { Text } from './text';
import { useState, useRef } from 'react';

export type ImgUploadProps = {
  onImageSelect?: (uri: string) => void;
  onImagesSelect?: (uris: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
};

const DEFAULT_MAX_IMAGES = 6;

function ImgUpload({
  onImageSelect,
  onImagesSelect,
  maxImages = DEFAULT_MAX_IMAGES,
  disabled = false,
  className,
}: ImgUploadProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const safeMaxImages = Math.max(0, maxImages);

  const updateSelectedImages = (uris: string[]) => {
    const nextUris = uris.slice(0, safeMaxImages);
    setSelectedImages(nextUris);
    onImagesSelect?.(nextUris);
    onImageSelect?.(nextUris[0]);
  };

  const handleWeb = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleNative = async () => {
    if (Platform.OS === 'web') return;
    if (safeMaxImages === 0) {
      Alert.alert('Image limit reached', 'You already have the maximum number of images.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: safeMaxImages,
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const uris = result.assets.map((asset) => asset.uri);
    updateSelectedImages(uris);
  };

  const handlePress = () => {
    if (disabled) return;
    if (safeMaxImages === 0) {
      Alert.alert('Image limit reached', 'You already have the maximum number of images.');
      return;
    }
    if (Platform.OS === 'web') {
      handleWeb();
      return;
    }
    void handleNative();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, safeMaxImages);
    if (!files.length) return;

    void Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((uris) => {
        updateSelectedImages(uris);
      })
      .catch(() => {
        Alert.alert('Upload failed', 'Unable to read one or more selected images.');
      });
  };

  return (
    <View className={cn('w-full', className)}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        className={cn(
          'border-input dark:bg-input/30 bg-background border-2 border-dashed rounded-lg min-h-[200px] gap-3 overflow-hidden relative p-3',
          disabled && 'opacity-50',
          'transition-colors'
        )}>
        {selectedImages.length > 0 ? (
          <>
            <View className="w-full flex-row flex-wrap gap-2">
              {selectedImages.map((uri, index) => (
                <View key={`${uri}-${index}`} className="w-[31%] aspect-square rounded-md overflow-hidden bg-muted">
                  <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                </View>
              ))}
            </View>
            <View className="bg-black/55 rounded-md px-3 py-2 absolute bottom-3 left-3 right-3">
              <Text className="text-white font-semibold text-center text-sm">
                {selectedImages.length} / {safeMaxImages} selected
              </Text>
              <Text className="text-white/90 text-xs text-center">Tap to change selection</Text>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center gap-3 py-8">
            <Upload
              size={32}
              className="text-muted-foreground"
              color={disabled ? '#a1a1a1' : '#737373'}
            />
            <View className="items-center gap-1">
              <Text className="text-foreground font-semibold text-center text-sm">
                {Platform.OS === 'web' ? 'Click to upload photos' : 'Tap to upload photos'}
              </Text>
              <Text className="text-muted-foreground text-xs">Up to {safeMaxImages} images</Text>
            </View>
          </View>
        )}
      </Pressable>

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      )}
    </View>
  );
}

export { ImgUpload };
