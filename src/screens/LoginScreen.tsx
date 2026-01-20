import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigation";
import { SignInForm } from "@/components/sign-in-form";
import { useThemeContext } from "../theme/ThemeContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { colorScheme } = useThemeContext();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
      }}
    >
      <SignInForm />
    </View>
  );
}
