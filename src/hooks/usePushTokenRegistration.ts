import { useEffect, useRef } from "react";
import { registerExpoPushTokenAsync } from "@/lib/notifications";

export function usePushTokenRegistration(userId?: string) {
  const lastRegisteredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    const register = async () => {
      try {
        const result = await registerExpoPushTokenAsync({ userId });

        if (cancelled || !result.ok) {
          if (!cancelled && result.reason === "endpoint-not-configured") {
            console.warn(
              "Push token endpoint is not configured. Set EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT.",
            );
          }

          if (!cancelled && result.reason === "request-failed") {
            console.warn("Failed to register Expo push token", result.status);
          }
          return;
        }

        if (result.expoPushToken === lastRegisteredTokenRef.current) {
          return;
        }

        lastRegisteredTokenRef.current = result.expoPushToken;
      } catch (error) {
        if (!cancelled) {
          console.warn("Error during Expo push token registration", error);
        }
      }
    };

    void register();

    return () => {
      cancelled = true;
    };
  }, [userId]);
}
