import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <PagerView style={styles.container} initialPage={0}>
                <View key="1" style={styles.page}>
                    <Text>Page 1</Text>
                </View>
                <View key="2" style={styles.page}>
                    <Text>Page 2</Text>
                </View>
                <View key="3" style={styles.page}>
                    <Text>Page 3</Text>
                </View>
            </PagerView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        justifyContent: "center",
        alignItems: "center",
    },
});