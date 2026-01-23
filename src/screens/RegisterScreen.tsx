import { View } from "react-native";
import { useThemeContext } from "../theme/ThemeContext";
import { SignUpForm } from "@/components/sign-up-form";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigation";

export default function RegisterScreen() {
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
      className="gap-4"
    >
      <SignUpForm onSignInPress={() => navigation.navigate("Login")} />
    </View>
  );
}
