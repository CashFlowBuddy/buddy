import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigation";
import { useEffect, useState } from "react";
import { authClient } from "./src/lib/auth-client";
import { ThemeProvider, ThemeContext } from "./src/theme/ThemeContext";
import LottieView from "lottie-react-native";
import { PortalHost } from "@rn-primitives/portal";
import { NAV_THEME } from "./src/lib/theme";
import { useColorScheme } from "nativewind";
import { StatusBar, View } from "react-native";
import { Text } from "./src/components/ui/text";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';
import StorybookUI from './.rnstorybook';

const isStorybook = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

function AppContent() {
  const { colorScheme } = useColorScheme();
  const { isPending: sessionLoading } = authClient.useSession();

  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!timerDone || sessionLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#222" : "#fff",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <LottieView
            source={require("./assets/splashAnimation.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          <Text className="text-3xl font-semibold" style={{ marginTop: -50 }}>
            CashFlowBuddy
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <NavigationContainer theme={NAV_THEME[colorScheme]}>
        <RootNavigator />
      </NavigationContainer>
      <PortalHost />
    </>
  );
}

export default function App() {
  if (isStorybook) {
    return <StorybookUI />;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <KeyboardProvider>
        <ThemeProvider>
          <AppContent/>
        </ThemeProvider>
      </KeyboardProvider>
    </TamaguiProvider>
  );
}
