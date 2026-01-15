import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigation';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from './src/style/theme';
import { useEffect, useState, useCallback } from 'react';
import { authClient } from './src/lib/auth-client';
import { ThemeContext } from './src/style/ThemeContext';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((theme) => {
      setColorScheme((theme as 'light' | 'dark') || 'light');
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setColorScheme((prev) => {
      const newScheme = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('theme', newScheme);
      return newScheme;
    });
  }, []);

  const [showLottie, setShowLottie] = useState(true);
  const [timerDone, setTimerDone] = useState(false);
  const { isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Show splash until both timer and session loading are done
  if (!timerDone || sessionLoading) {
    return (
      <LottieView
        source={require('./assets/splashAnimation.json')}
        autoPlay
        loop
        style={{
          flex: 1,
          backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
        }}
      />
    );
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      <PaperProvider theme={colorScheme === 'dark' ? DarkTheme : LightTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}
