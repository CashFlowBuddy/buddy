import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigation';
import { authClient } from '../lib/auth-client';
import { useTheme } from 'react-native-paper';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const styleSheet = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await authClient.signIn.email({
        email,
        password
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      console.log('Login error:', err);
    }
  }

  return (
    <View style={styleSheet.container}>
      <Text>Login</Text>
      <TextInput
        mode='outlined'
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        mode='outlined'
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && (
        <Text style={{ color: 'red' }}>
          {error}
        </Text>
      )}
      <Button onPress={handleLogin}>
        Login
      </Button>
      <Button onPress={() => navigation.navigate('Register')}>
        Go to Register
      </Button>
    </View>
  );
}


import type { MD3Theme } from 'react-native-paper';

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  }
});

