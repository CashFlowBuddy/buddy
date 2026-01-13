import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { authClient } from "../../lib/auth-client";

export default function RegisterScreen() {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    await authClient.signUp.email({
      email,
      name,
      password
    });
  }


  return (
    <View>
      <Text>Register Screen</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button onPress={handleRegister}>
        Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({

});