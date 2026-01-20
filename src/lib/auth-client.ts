import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "http://10.192.164.82:3000",
    plugins: [
        expoClient({
            scheme: "myapp",
            storagePrefix: "myapp",
            storage: SecureStore,
        })
    ]
});