import { View } from "react-native";
import PagerView from "react-native-pager-view";
import HomePage from "./pages/HomePage";
import MessagePage from "./pages/MessagePage";
import SellPage from "./pages/SellPage";
import { SearchBar } from "@/components/ui/search-bar";
import { authClient } from "../lib/auth-client";
import { Avatar, AvatarImage } from '@/components/ui/avatar';

export default function HomeScreen() {
    const { data: session } = authClient.useSession();
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                }}
            >
                <View className="flex-row items-center gap-2">
                    <SearchBar
                        className="flex-1"
                        value=""
                        onChangeText={() => {}}
                        onClear={() => {}}
                    />
                    <Avatar alt="">
                        <AvatarImage source={session?.user?.image ? { uri: session.user.image } : undefined} className="size-8" />
                    </Avatar>
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
