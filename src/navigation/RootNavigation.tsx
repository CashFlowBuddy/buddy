import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigation from './AuthNavigation';
import AppNavigation from './AppNavigation';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const isLoggedIn = true; // replace with auth state

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={AppNavigation} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigation} />
      )}
    </Stack.Navigator>
  );
}
