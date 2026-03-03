import { createAuthClient } from "better-auth/react";
import { expoClient, getCookie } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const AUTH_STORAGE_PREFIX = "myapp";
const AUTH_COOKIE_STORAGE_KEY = `${AUTH_STORAGE_PREFIX}_cookie`;

export const authClient = createAuthClient({
    baseURL: "https://api.saserver.hu/",
    plugins: [
        expoClient({
            scheme: "myapp",
            storagePrefix: AUTH_STORAGE_PREFIX,
            cookiePrefix: ["better-auth", AUTH_STORAGE_PREFIX],
            storage: SecureStore,
        })
    ]
});

export async function getAuthCookieHeader(): Promise<string> {
    const storedCookie = await SecureStore.getItemAsync(AUTH_COOKIE_STORAGE_KEY);
    if (!storedCookie) {
        return "";
    }

    return getCookie(storedCookie);
}