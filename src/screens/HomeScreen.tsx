import { View } from "react-native";
import PagerView from "react-native-pager-view";
import HomePage from "./pages/HomePage";
import MessagePage from "./pages/MessagePage";
import ProfilePage from "./pages/ProfilePage";

export default function HomeScreen() {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <PagerView style={{ flex: 1 }} initialPage={0}>
                <View key="1" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <HomePage />
                </View>
                <View key="2" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <MessagePage />
                </View>
                <View key="3" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ProfilePage />
                </View>
            </PagerView>
        </View>
    );
}
