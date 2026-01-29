import { View } from "react-native";
import { SignInForm } from "@/components/sign-in-form";
import { useThemeContext } from "../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigation";

export default function LoginScreen() {
  const { colorScheme } = useThemeContext();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
      }}
    >
      <SignInForm onSignUpPress={() => navigation.navigate("Register")} />
    </View>
  );
}
