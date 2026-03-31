import * as React from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as SelectPrimitive from '@rn-primitives/select';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
};

type AppSelectProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
}: AppSelectProps) {
  const selectedOption = React.useMemo(() => {
    const option = options.find((item) => item.value === value);
    return option ? { value: option.value, label: option.label } : undefined;
  }, [options, value]);

  return (
    <SelectPrimitive.Root
      disabled={disabled}
      value={selectedOption}
      onValueChange={(nextOption) => onValueChange(nextOption?.value ?? '')}>
      <SelectPrimitive.Trigger
        className={cn(
          'border-input bg-background flex h-10 w-full flex-row items-center justify-between rounded-md border px-3 py-2',
          disabled && 'opacity-50'
        )}>
        <SelectPrimitive.Value
          placeholder={placeholder}
          className="text-foreground text-sm"
        />
        <ChevronDown size={16} className="text-muted-foreground" />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Overlay
          closeOnPress
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/40"
        />
        <SelectPrimitive.Content
          sideOffset={8}
          className="bg-popover border-border z-50 w-72 rounded-md border p-1 shadow-md shadow-black/10">
          <SelectPrimitive.ScrollUpButton>
            <View className="items-center py-1">
              <ChevronUp size={16} className="text-muted-foreground" />
            </View>
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                label={option.label}
                closeOnPress
                className="active:bg-accent flex-row items-center justify-between rounded-sm px-3 py-2">
                <SelectPrimitive.ItemText className="text-foreground text-sm" />
                <SelectPrimitive.ItemIndicator>
                  <Check size={16} className="text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton>
            <View className="items-center py-1">
              <ChevronDown size={16} className="text-muted-foreground" />
            </View>
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { AppSelect };
export type { AppSelectProps };
