import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { authClient } from "../lib/auth-client";
import { useThemeContext } from "../theme/ThemeContext";

export default function RegisterScreen() {
  const { colorScheme } = useThemeContext();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await authClient.signUp.email({
      email,
      name,
      password,
    });
  };

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
      <Text variant="h3" className="text-center">
        Create account
      </Text>

      <View className="gap-3">
        <Input placeholder="Name" value={name} onChangeText={setName} />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Button onPress={handleRegister} className="w-full">
        <Text>Register</Text>
      </Button>
    </View>
  );
}
