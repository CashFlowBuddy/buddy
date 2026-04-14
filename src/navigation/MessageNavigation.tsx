import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagePage from "@/screens/pages/MessagePage";
import ChatScreen from "@/screens/ChatScreen";

import type { User } from "@/lib/interfaces";

export type MessageStackParamList = {
  ChatRooms: undefined;
  Chat: { chatRoomId: string; title: string; users: User[] };
};

const Stack = createNativeStackNavigator<MessageStackParamList>();

export default function MessageNavigation() {
  return (
    <Stack.Navigator id="message-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatRooms" component={MessagePage} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
}
