import React from "react";
import { ScrollView } from "react-native";
import { authClient } from "../../lib/auth-client";
import { useColorScheme, View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react-native";
import AccSetDial from "../dialogs/AccSetDial";
import SellsDial from "../dialogs/SellsDial";
import NotificationDial from "../dialogs/NotificationDial";
import PrivacyDial from "../dialogs/PrivacyDial";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const colorScheme = useColorScheme();

  function handleSignOut() {
    authClient.signOut();
  }
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="px-4 py-6">
        <View className="mb-8">
          <View className="flex-row items-center gap-4">
            <Avatar alt={session?.user?.name || "User"}>
              <AvatarImage
                source={{ uri: session?.user?.image }}
              />
              <AvatarFallback>
                <Text>{session?.user?.name ? session.user.name[0] : "U"}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">
                {session?.user?.name || "User"}
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {session?.user?.email || "Not provided"}
              </Text>
            </View>
          </View>
          {session?.user?.emailVerified && (
            <Badge variant="default" className="mt-3 w-40">
              <Text className="text-xs">Verified</Text>
            </Badge>
          )}
        </View>

        <View className="gap-3 mb-8">
          <Button
            variant="outline"
            className="justify-between w-full"
            onPress={() => {}}
          >
            <Text>Favourites</Text>
            <ChevronRight
              size={20}
              color={colorScheme === "dark" ? "#fafafa" : "#0a0a0a"}
            />
          </Button>
        </View>

        <View className="gap-2 mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
            Settings
          </Text>
          <SellsDial />
          <AccSetDial />
          <NotificationDial />
          <PrivacyDial />
        </View>

        <View className="mb-4">
          <Button
            variant="destructive"
            className="w-full"
            onPress={handleSignOut}
          >
            <Text>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

