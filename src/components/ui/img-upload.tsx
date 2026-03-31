import { cn } from '@/lib/utils';
import { Image, Platform, Pressable, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import { Text } from './text';
import { useState, useRef } from 'react';

export type ImgUploadProps = {
  onImageSelect?: (uri: string) => void;
  disabled?: boolean;
  className?: string;
};

function ImgUpload({ onImageSelect, disabled = false, className }: ImgUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWeb = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uri = e.target?.result as string;
        setSelectedImage(uri);
        onImageSelect?.(uri);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <View className={cn('w-full', className)}>
      <Pressable
        disabled={disabled}
        onPress={handleWeb}
        className={cn(
          'border-input dark:bg-input/30 bg-background border-2 border-dashed rounded-lg p-8 items-center justify-center min-h-[200px] gap-3',
          disabled && 'opacity-50',
          'transition-colors'
        )}>
        <Upload
          size={32}
          className="text-muted-foreground"
          color={disabled ? '#a1a1a1' : '#737373'}
        />
        <View className="items-center gap-1">
          <Text className="text-foreground font-semibold text-center text-sm">
            {selectedImage ? 'Image selected' : 'Click to upload photo'}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {selectedImage ? 'Tap again to change' : 'JPG, PNG up to 5MB'}
          </Text>
        </View>
      </Pressable>

      {selectedImage && (
        <View className="mt-4 rounded-md overflow-hidden border border-input">
          <Image
            source={{ uri: selectedImage }}
            className="w-full h-40"
            resizeMode="cover"
          />
        </View>
      )}

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      )}
    </View>
  );
}

export { ImgUpload };
