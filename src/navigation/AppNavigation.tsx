import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FavouritesPage from "@/screens/pages/FavouritesPage";
import MyListingsPage from "@/screens/pages/MyListingsPage";
import ListingDetailPage from "../screens/pages/ListingDetailPage";
import ChatScreen from "@/screens/ChatScreen";
import type { ChatScreenParams, ListingDetailParams } from "./routeTypes";

export type AppStackParamList = {
  Home: undefined;
  Account: undefined;
  Favourites: undefined;
  MyListings: undefined;
  ListingDetail: ListingDetailParams;
  Chat: ChatScreenParams;
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
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailPage}
        options={{
          headerShown: true,
          title: "Listing",
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
}
