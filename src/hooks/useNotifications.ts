import { useCallback, useEffect, useState } from "react";
import {
  ensureNotificationSystemAsync,
  getNotificationPermissionStatusAsync,
  requestNotificationPermissionAsync,
  type NotificationPermissionStatus,
} from "@/lib/notifications";

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getNotificationPermissionStatusAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  const requestPermission = useCallback(async () => {
    const status = await requestNotificationPermissionAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await ensureNotificationSystemAsync();

      if (!isMounted) {
        return;
      }

      await refreshPermissionStatus();

      if (isMounted) {
        setIsInitializing(false);
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [refreshPermissionStatus]);

  return {
    isInitializing,
    permissionStatus,
    refreshPermissionStatus,
    requestPermission,
  };
}