import { View, Text, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { Appbar, Button, useTheme } from "react-native-paper";
import { authClient } from "../lib/auth-client";
import { useThemeContext } from "../style/ThemeContext";
import type { MD3Theme } from "react-native-paper";

export default function HomeScreen() {
    const { toggleTheme } = useThemeContext();
    const theme = useTheme();
    const styleSheet = createStyles(theme);
    const handleLogout = async () => {
        try {
            await authClient.signOut();
        } catch (error) {
        }
    };
    return (
        <View style={styleSheet.container}>
            <Appbar.Header>
                <Appbar.Content title="Home" />
                <Button onPress={handleLogout}>
                    Log out
                </Button>
                <Button onPress={toggleTheme}>
                    Toggle Theme
                </Button>
            </Appbar.Header>
            <PagerView style={styleSheet.container} initialPage={0}>
                <View key="1" style={styleSheet.page}>
                    <Text style={styleSheet.title}>Page 1</Text>
                </View>
                <View key="2" style={styleSheet.page}>
                    <Text style={styleSheet.title}>Page 2</Text>
                </View>
                <View key="3" style={styleSheet.page}>
                    <Text style={styleSheet.title}>Page 3</Text>
                </View>
            </PagerView>
        </View>
    );
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    page: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
    },
    title: {
        color: theme.colors.onBackground,
    },
});