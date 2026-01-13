import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigation';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from './src/style/theme';
import { useEffect, useState } from 'react';

export default function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((theme) => {
      setColorScheme((theme as 'light' | 'dark') || 'light');
    });
  }, []);

  return (
    <PaperProvider theme={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
