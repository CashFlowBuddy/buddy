import { Button } from "react-native-paper";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";


export default function SocialLoginBtn() {
    const handleLogin = async () => {
        try {
            await authClient.signIn.social({
                provider: 'github',
            });
        } catch (error) {
        }
    }

    return (
        <Button onPress={handleLogin}>
            Continue with GitHub
        </Button>
    );
}