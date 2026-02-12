import React from "react";
import { authClient } from "../../lib/auth-client";
import { View, Image } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  function handleSignOut() {
    authClient.signOut();
  }
  return (
    <View className="flex-1 bg-background py-6">
      <Text className="text-2xl font-bold mb-4">Profile</Text>
      <Separator orientation="horizontal" />
      <View className="items-center-safe flex-row gap-4 ">
        <Avatar alt={session?.user?.name || "User"} className="mt-4">
          <AvatarImage source={{ uri: session?.user?.image }} />
          <AvatarFallback>
            <Text>{session?.user?.name ? session.user.name[0] : "U"}</Text>
          </AvatarFallback>
        </Avatar>
        <Text className="text-lg font-semibold">
          {session?.user?.name || "User"}
        </Text>
      </View>
      <Separator orientation="horizontal" className="my-4" />
      <View className="px-4">
        <Button
          variant="outline"
          className="w-full mb-2"
          onPress={handleSignOut}
        >   
          <Text>Sign Out</Text>
        </Button>
      </View>
    </View>
  );
}
