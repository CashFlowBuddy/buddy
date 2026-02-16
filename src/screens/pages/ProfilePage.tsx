import React from "react";
import { ScrollView } from "react-native";
import { authClient } from "../../lib/auth-client";
import { useColorScheme, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react-native";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  function handleSignOut() {
    authClient.signOut();
  }
  return (
    <View className="flex-1 bg-background py-6">

      <ScrollView>
        <Card className="mb-4 p-4 w-fit">
          <CardHeader className="text-lg font-semibold mb-4">
            <Text variant="h2">Profile</Text>
          </CardHeader>
          <View className="items-center flex-row">
            <Avatar alt={session?.user?.name || "User"}>
              <AvatarImage source={{ uri: session?.user?.image }} className="" />
              <AvatarFallback>
                <Text>{session?.user?.name ? session.user.name[0] : "U"}</Text>
              </AvatarFallback>
            </Avatar>
            <Text className="text-lg font-semibold ml-4">
              {session?.user?.name || "User"}
            </Text>
          </View>
        </Card>
        <Separator orientation="horizontal" className="mb-4" />
        <Card className="mb-4 p-4 w-fit">
          <CardHeader className="text-lg font-semibold mb-4">
            <Text variant="h2"> Account Details</Text>
          </CardHeader>
          <View className="items-baseline">
            <Text className="text-base">
              Email: {session?.user?.email || "Not provided"}
            </Text>
            <Badge variant={session?.user?.emailVerified ? "default" : "destructive"} className="ml-2">
              <Text>
                {session?.user?.emailVerified ? "Verified" : "Unverified"}
              </Text>
            </Badge>
          </View>
        </Card>
        <Separator orientation="horizontal" className="mb-4" />
        <Card className="mb-4 p-4 w-fit">
          <Button variant="ghost" className="justify-between" onPress={() => {}}>
            <Text>Favourites</Text>
            <ChevronRight color={useColorScheme() === "dark" ? "white" : "black"} />
          </Button>
          <Separator orientation="horizontal"/>
          <Button variant="ghost" className="justify-between" onPress={() => {}}>
            <Text>Sells</Text>
            <ChevronRight color={useColorScheme() === "dark" ? "white" : "black"} />
          </Button>
            <Separator orientation="horizontal"/>
          <Button variant="ghost" className="justify-between" onPress={() => {}}>
            <Text>Account Settings</Text>
            <ChevronRight color={useColorScheme() === "dark" ? "white" : "black"} />
          </Button>
            <Separator orientation="horizontal"/>
          <Button variant="ghost" className="justify-between" onPress={() => {}}>
            <Text>Notifications</Text>
            <ChevronRight color={useColorScheme() === "dark" ? "white" : "black"} />
          </Button>
        </Card>
        <Separator orientation="horizontal" className="mb-4" />
        <View className="px-4">
          <Button
            variant="destructive"
            className="w-full mb-2"
            onPress={handleSignOut}
          >
            <Text>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>

    </View>
  );
} // TODO: favourites (button), sells(button), profile details, account settings, notifications
