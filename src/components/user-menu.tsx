import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { TriggerRef } from '@rn-primitives/popover';
import { LogOutIcon, SettingsIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { authClient } from '../lib/auth-client';
import { useRef, type ComponentProps } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/navigation/AppNavigation';


export function UserMenu() {
  const { data: session } = authClient.useSession();
  const popoverTriggerRef = useRef<TriggerRef>(null);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();  

  const USER = {
    fullName: session?.user?.name ?? 'Zach Nugent',
    initials: session?.user?.name
      ? session.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'ZN',
    imgSrc: session?.user?.image,
    username: session?.user?.name ?? 'mrzachnugent',
  };

  async function onSignOut() {
    popoverTriggerRef.current?.close();
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <UserAvatar user={USER} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="center" side="bottom" className="w-80 p-0">
        <View className="border-border gap-3 border-b p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar user={USER} className="size-10" />
            <View className="flex-1">
              <Text className="font-medium leading-5">{USER.fullName}</Text>
              {USER.fullName?.length ? (
                <Text className="text-muted-foreground text-sm font-normal leading-4">
                  {USER.username}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 py-0.5">
            <Button 
            variant="outline" 
            size="sm"
            onPress={() => navigation.navigate('Account')}
            >
              <Icon as={SettingsIcon} className="size-4" />
              <Text>Manage Account</Text>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onPress={onSignOut}
            >
              <Icon as={LogOutIcon} className="size-4" />
              <Text>Sign Out</Text>
            </Button>
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}

type UserAvatarProps = Omit<ComponentProps<typeof Avatar>, 'alt'> & {
  user: {
    fullName: string;
    initials: string;
    imgSrc?: string;
  };
};

function UserAvatar({ className, user, ...props }: UserAvatarProps) {
  return (
    <Avatar
      alt={`${user.fullName}'s avatar`}
      className={cn('size-8', className)}
      {...props}
    >
      <AvatarImage source={user.imgSrc ? { uri: user.imgSrc } : undefined} />
      <AvatarFallback>
        <Text>{user.initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
