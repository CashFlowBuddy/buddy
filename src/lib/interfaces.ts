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

export interface ListingPicture {
  id: string;
  url: string;
  listingId: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  status?: string;
  url?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  pictures?: ListingPicture[];
  user?: User;
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