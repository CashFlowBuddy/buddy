export interface User {
  id: string;
  name: string;
  image?: string | null;
}

export interface Message {
  id: string;
  content: string;
  byUserId: string;
  chatRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
}

export interface ChatRoom {
  id: string;
  forListingId: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
  forListing: Listing;
  messages: Message[];
}