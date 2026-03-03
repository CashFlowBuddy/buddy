import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigation from "./AuthNavigation";
import AppNavigation from "./AppNavigation";
import { authClient } from "../lib/auth-client";
import { StatusBar, View } from "react-native";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { data: session } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0}} className="bg-background">
      <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppNavigation} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigation} />
        )}
      </Stack.Navigator>
    </View>
  );
}
