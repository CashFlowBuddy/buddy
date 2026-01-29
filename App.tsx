import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigation";
import { useEffect, useState } from "react";
import { authClient } from "./src/lib/auth-client";
import { ThemeProvider, ThemeContext } from "./src/theme/ThemeContext";
import LottieView from "lottie-react-native";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { NAV_THEME } from "./src/lib/theme";
import { useColorScheme } from "nativewind";

function AppContent() {
  const { colorScheme } = useColorScheme();
  const { isPending: sessionLoading } = authClient.useSession();

  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!timerDone || sessionLoading) {
    return (
      <LottieView
        source={require("./assets/splashAnimation.json")}
        autoPlay
        loop
        style={{
          flex: 1,
          backgroundColor: colorScheme === "dark" ? "#222" : "#fff",
        }}
      />
    );
  }

  return (
    <ThemeProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={NAV_THEME[colorScheme]}>
        <RootNavigator />
      </NavigationContainer>
      <PortalHost />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
