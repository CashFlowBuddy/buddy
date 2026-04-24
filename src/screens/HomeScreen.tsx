import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import PagerView from "react-native-pager-view";
import HomePage from "./pages/ListingPage";
import MessageNavigation from "@/navigation/MessageNavigation";
import ProfilePage from "./pages/ProfilePage";
import { authClient } from "@/lib/auth-client";
import { useMessageNotificationsSocket } from "@/hooks/useMessageNotificationsSocket";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House, MessageSquareText, UserRound } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type TabKey = "home" | "messages" | "profile";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState(0);

  useMessageNotificationsSocket(currentUserId);

  const pagerRef = useRef<PagerView>(null);
  const setPagerScrollEnabled = useCallback((enabled: boolean) => {
    pagerRef.current?.setScrollEnabled(enabled);
  }, []);

  const tabs = useMemo(
    () => [
      {
        key: "home" as TabKey,
        label: "Home",
        icon: House,
        pageIndex: 0,
      },
      {
        key: "messages" as TabKey,
        label: "Messages",
        icon: MessageSquareText,
        pageIndex: 1,
      },
      {
        key: "profile" as TabKey,
        label: "Profile",
        icon: UserRound,
        pageIndex: 2,
      },
    ],
    [],
  );

  const goToPage = useCallback((pageIndex: number) => {
    pagerRef.current?.setPage(pageIndex);
    setActivePage(pageIndex);
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(event) => {
          setActivePage(event.nativeEvent.position);
        }}
      >
        <View
          key="1"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 86 + insets.bottom }}
        >
          <HomePage setPagerScrollEnabled={setPagerScrollEnabled} />
        </View>
        <View
          key="2"
          style={{ flex: 1, paddingBottom: 86 + insets.bottom }}
        >
          <MessageNavigation />
        </View>
        <View
          key="3"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 86 + insets.bottom }}
        >
          <ProfilePage />
        </View>
      </PagerView>

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center"
        style={{ bottom: Math.max(insets.bottom, 10) }}
      >
        <View className="flex-row items-center gap-2 rounded-full border border-border/70 bg-background/95 px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activePage === tab.pageIndex;

            return (
              <Pressable
                key={tab.key}
                onPress={() => goToPage(tab.pageIndex)}
                className={
                  "min-w-[96px] flex-row items-center justify-center gap-2 rounded-full px-4 py-2 " +
                  (isActive ? "bg-foreground" : "bg-transparent")
                }
              >
                <Icon
                  as={tab.icon}
                  size={16}
                  className={isActive ? "text-background" : "text-foreground"}
                />
                <Text
                  className={
                    "text-xs font-medium " +
                    (isActive ? "text-background" : "text-foreground")
                  }
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
