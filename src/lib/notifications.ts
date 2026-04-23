import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthCookieHeader } from "@/lib/auth-client";

let notificationSystemReady = false;

export type NotificationPermissionStatus = Notifications.PermissionStatus;

export type ChatNotificationInput = {
  conversationTitle?: string;
  senderName?: string;
  messagePreview: string;
};

type RegisterPushTokenParams = {
  userId?: string;
};

const PUSH_TOKEN_ENDPOINT =
  process.env.EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT;

function truncateText(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getNotificationPermissionLabel(status: NotificationPermissionStatus) {
  switch (status) {
    case "granted":
      return "Enabled";
    case "denied":
      return "Blocked";
    case "undetermined":
    default:
      return "Not set up";
  }
}

export async function ensureNotificationSystemAsync() {
  if (!notificationSystemReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    notificationSystemReady = true;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0f172a",
      sound: "default",
    });
  }
}

export async function getNotificationPermissionStatusAsync() {
  await ensureNotificationSystemAsync();
  const permissions = await Notifications.getPermissionsAsync();

  return permissions.status;
}

export async function requestNotificationPermissionAsync() {
  await ensureNotificationSystemAsync();

  const currentPermissions = await Notifications.getPermissionsAsync();
  if (currentPermissions.status === "granted") {
    return currentPermissions.status;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requestedPermissions.status;
}

export async function scheduleChatNotificationAsync({
  conversationTitle,
  senderName,
  messagePreview,
}: ChatNotificationInput) {
  await ensureNotificationSystemAsync();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return false;
  }

  const notificationTitle = conversationTitle
    ? `New message in ${conversationTitle}`
    : "New message";
  const senderPrefix = senderName ? `${senderName}: ` : "";
  const notificationBody = truncateText(
    `${senderPrefix}${messagePreview}`.trim(),
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notificationTitle,
      body: notificationBody,
      sound: "default",
      data: {
        type: "chat-message",
        conversationTitle: conversationTitle ?? null,
        senderName: senderName ?? null,
      },
    },
    trigger: null,
  });

  return true;
}

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
  );
}

export async function getExpoPushTokenAsync() {
  await ensureNotificationSystemAsync();

  const permissionStatus = await requestNotificationPermissionAsync();
  if (permissionStatus !== "granted") {
    return null;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenResponse.data;
}

export async function registerExpoPushTokenAsync({
  userId,
}: RegisterPushTokenParams = {}) {
  if (!PUSH_TOKEN_ENDPOINT) {
    return {
      ok: false as const,
      reason: "endpoint-not-configured" as const,
    };
  }

  const expoPushToken = await getExpoPushTokenAsync();
  if (!expoPushToken) {
    return { ok: false as const, reason: "no-token" as const };
  }

  const authHeader = await getAuthCookieHeader();

  const response = await fetch(PUSH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Cookie: authHeader } : {}),
    },
    body: JSON.stringify({
      userId,
      expoPushToken,
      platform: Platform.OS,
    }),
  });

  if (!response.ok) {
    return {
      ok: false as const,
      reason: "request-failed" as const,
      status: response.status,
    };
  }

  return { ok: true as const, expoPushToken };
}