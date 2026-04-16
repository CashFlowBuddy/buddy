import type { Listing, User } from "@/lib/interfaces";

export type ChatScreenParams = {
  chatRoomId: string;
  title: string;
  users: User[];
};

export type ListingDetailParams = {
  listing: Listing;
};