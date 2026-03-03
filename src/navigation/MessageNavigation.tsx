import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagePage from "@/screens/pages/MessagePage";
import ChatScreen from "@/screens/pages/ChatScreen";

export type MessageStackParamList = {
  ChatRooms: undefined;
  Chat: { chatRoomId: string; title: string };
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
