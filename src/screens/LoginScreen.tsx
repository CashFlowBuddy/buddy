import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useThemeContext } from "../theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { colorScheme } = useThemeContext();
  const [authTab, setAuthTab] = useState("sign-in");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
      }}
    >
      <View className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-primary/10" />
      <View className="absolute -right-20 top-24 h-56 w-56 rounded-full bg-primary/10" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}
      >
        <View className="w-full self-center max-w-[430px]">
          <View className="mb-5 gap-1 px-1">
            <Text className="text-3xl font-bold text-foreground">CashFlowBuddy</Text>
            <Text className="text-sm text-muted-foreground">
              Buy, sell, and chat in one place.
            </Text>
          </View>

          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="mb-4 h-12 w-full rounded-2xl border border-border/50 bg-muted/60 p-1">
              <TabsTrigger value="sign-in" className="flex-1 rounded-xl">
                <Text>Sign in</Text>
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="flex-1 rounded-xl">
                <Text>Sign up</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              <SignInForm onSignUpPress={() => setAuthTab("sign-up")} />
            </TabsContent>

            <TabsContent value="sign-up">
              <SignUpForm onSignInPress={() => setAuthTab("sign-in")} />
            </TabsContent>
          </Tabs>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
