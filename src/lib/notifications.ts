import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let notificationSystemReady = false;

export type NotificationPermissionStatus = Notifications.PermissionStatus;

export type ChatNotificationInput = {
  conversationTitle?: string;
  senderName?: string;
  messagePreview: string;
};

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