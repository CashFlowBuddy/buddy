export type ChatMessage = {
  id: string;
  content: string;
  byUserId: string;
  chatRoomId: string;
  createdAt: string;
  updatedAt: string;
};

export type TypingPayload = {
  userId: string;
  userName: string;
  isTyping: boolean;
};