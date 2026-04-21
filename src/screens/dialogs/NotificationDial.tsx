import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react-native";
import { View, Linking } from "react-native";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationPermissionLabel } from "@/lib/notifications";

export default function NotificationDial() {
  const {
    isInitializing,
    permissionStatus,
    requestPermission,
    refreshPermissionStatus,
  } = useNotifications();

  const permissionLabel = getNotificationPermissionLabel(permissionStatus);
  const notificationsEnabled = permissionStatus === "granted";

  const handleEnableNotifications = async () => {
    if (permissionStatus === "denied") {
      await Linking.openSettings();
      await refreshPermissionStatus();
      return;
    }

    await requestPermission();
  };

  const deliveryStatus = notificationsEnabled ? "On" : "Off";
  const channelStatus = notificationsEnabled ? "Default" : "Unavailable";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Text>Notifications</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <View className="gap-4 pt-3">
          <Alert icon={notificationsEnabled ? CheckCircle2 : BellOff}>
            <AlertTitle>{permissionLabel}</AlertTitle>
            <AlertDescription>
              Manage how message notifications are delivered for your account.
            </AlertDescription>
          </Alert>

          <View className="rounded-lg border border-border bg-card px-4 py-3 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Message notifications</Text>
              <Text className="text-sm font-medium text-foreground">{deliveryStatus}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Sound</Text>
              <Text className="text-sm text-muted-foreground">{deliveryStatus}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Android channel</Text>
              <Text className="text-sm text-muted-foreground">{channelStatus}</Text>
            </View>
          </View>

          <View className="gap-3">
            <Button
              variant="default"
              className="w-full"
              onPress={handleEnableNotifications}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <>
                  <Loader2 size={16} color="#fff" />
                  <Text>Checking permissions</Text>
                </>
              ) : notificationsEnabled ? (
                <>
                  <Bell size={16} color="#fff" />
                  <Text>Notifications enabled</Text>
                </>
              ) : (
                <>
                  <Bell size={16} color="#fff" />
                  <Text>
                    {permissionStatus === "denied"
                      ? "Open system settings"
                      : "Enable notifications"}
                  </Text>
                </>
              )}
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
