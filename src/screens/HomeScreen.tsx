import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { Text } from "@/components/ui/text";
import HomePage from "./pages/HomePage";
import MessagePage from "./pages/MessagePage";
import SellPage from "./pages/SellPage";
import { UserMenu } from "@/components/user-menu";

export default function HomeScreen() {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                }}
            >
                <View className="flex-row items-center gap-2">
                    <Text className="flex-1 text-lg font-semibold">Home</Text>
                    <UserMenu />
                </View>
            </View>

            <PagerView style={{ flex: 1 }} initialPage={0}>
                <View key="1" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <HomePage />
                </View>
                <View key="2" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <MessagePage />
                </View>
                <View key="3" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <SellPage />
                </View>
            </PagerView>
        </View>
    );
}
