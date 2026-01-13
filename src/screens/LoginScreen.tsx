import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Login</Text>
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}
