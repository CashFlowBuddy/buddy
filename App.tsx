import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import { authClient } from "./src/lib/auth-client";
import { ThemeContext } from "./src/theme/ThemeContext";
import LottieView from "lottie-react-native";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { NAV_THEME } from "./src/lib/theme";

export default function App() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((theme) => {
      setColorScheme((theme as "light" | "dark") || "light");
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setColorScheme((prev) => {
      const newScheme = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem("theme", newScheme);
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
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={NAV_THEME[colorScheme]}>
        <RootNavigator />
      </NavigationContainer>
      <PortalHost />
    </ThemeContext.Provider>
  );
}
