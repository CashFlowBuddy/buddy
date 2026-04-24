import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import { authClient } from '@/lib/auth-client';

type SignInFormProps = {
  onSignUpPress?: () => void;
};

export function SignInForm({ onSignUpPress }: SignInFormProps) {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    try {
      await authClient.signIn.email({
        email,
        password,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Sign in failed");
      console.log("Sign in error:", err);
    }
  }

  return (
    <View className="gap-6">
      <Card className="rounded-2xl border border-border/60 bg-background/95 shadow-sm shadow-black/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl sm:text-left">Welcome back</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Sign in to continue to your marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                defaultValue={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="username"
                importantForAutofill="yes"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                  }}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                autoComplete="password"
                importantForAutofill="yes"
                defaultValue={password}
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button className="w-full" onPress={onSubmit}>
              <Text>Sign in</Text>
            </Button>
          </View>
          {!!error && <Text className="text-destructive text-sm">{error}</Text>}
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Pressable
              onPress={() => {
                onSignUpPress?.();
              }}>
              <Text className="text-primary text-sm underline underline-offset-4">Sign up</Text>
            </Pressable>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground px-4 text-sm">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
