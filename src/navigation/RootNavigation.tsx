import {NavigationContainer} from '@react-navigation/native';
import AuthNavigator from './AuthNavigation';
import AppNavigator from './AppNavigation';

export default function RootNavigator() {
    const isLoggedIn = false; // Need to replace when the auth logic is implemented
  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}