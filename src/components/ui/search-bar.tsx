import * as React from 'react';
import { Platform, TextInput, View, Pressable } from 'react-native';
import type { TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react-native';

type SearchBarProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
};

function SearchBar({
  className,
  value,
  onChangeText,
  onClear,
  editable = true,
  ...props
}: SearchBarProps) {
  return (
    <View className="relative w-full flex-row items-center">
      <Search
        size={18}
        className="absolute left-3 z-10 text-muted-foreground"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder="Search…"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        className={cn(
          'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 rounded-md border px-3 py-1 pl-10 pr-10 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
          editable === false &&
            cn(
              'opacity-50',
              Platform.select({
                web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
              })
            ),
          Platform.select({
            web: cn(
              'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
            ),
            native: 'placeholder:text-muted-foreground/50',
          }),
          className
        )}
        {...props}
      />

      {/* Clear button */}
      {value.length > 0 && editable && (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
          className="absolute right-3"
        >
          <X size={16} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}

export { SearchBar };
