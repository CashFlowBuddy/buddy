import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FavouritesPage from "@/screens/pages/FavouritesPage";
import MyListingsPage from "@/screens/pages/MyListingsPage";

export type AppStackParamList = {
  Home: undefined;
  Account: undefined;
  Favourites: undefined;
  MyListings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigation() {
  return (
    <Stack.Navigator id="app-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Favourites"
        component={FavouritesPage}
        options={{
          headerShown: true,
          title: "Favourites",
        }}
      />
      <Stack.Screen
        name="MyListings"
        component={MyListingsPage}
        options={{
          headerShown: true,
          title: "My Listings",
        }}
      />
    </Stack.Navigator>
  );
}
