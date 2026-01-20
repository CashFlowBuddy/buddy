import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigation from "./AuthNavigation";
import AppNavigation from "./AppNavigation";
import { authClient } from "../lib/auth-client";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { data: session } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  return (
    <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={AppNavigation} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigation} />
      )}
    </Stack.Navigator>
  );
}
