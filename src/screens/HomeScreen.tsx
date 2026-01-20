import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { authClient } from "../lib/auth-client";
import { useThemeContext } from "../theme/ThemeContext";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function HomeScreen() {
    const { toggleTheme, colorScheme } = useThemeContext();
    const handleLogout = async () => {
        try {
            await authClient.signOut();
        } catch (error) {
        }
    };
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
            }}
        >
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colorScheme === "dark" ? "#222" : "#e5e5e5",
                }}
            >
                <View className="flex-row items-center gap-2">
                    <Text className="flex-1 text-lg font-semibold">Home</Text>
                    <Button variant="outline" size="sm" onPress={handleLogout}>
                        <Text>Log out</Text>
                    </Button>
                    <Button variant="outline" size="sm" onPress={toggleTheme}>
                        <Text>Toggle Theme</Text>
                    </Button>
                </View>
            </View>

            <PagerView style={{ flex: 1 }} initialPage={0}>
                <View key="1" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>Page 1</Text>
                </View>
                <View key="2" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>Page 2</Text>
                </View>
                <View key="3" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>Page 3</Text>
                </View>
            </PagerView>
        </View>
    );
}
