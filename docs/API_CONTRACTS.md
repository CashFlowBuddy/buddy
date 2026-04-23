# API Contracts

## Overview

The app consumes a custom backend through:

- REST endpoints (via `fetch`).
- Better Auth client SDK calls.
- Socket.IO events for realtime chat.

Primary hosts currently used in code:

- `https://api.saserver.hu`
- `https://cash.saserver.hu`

Note: these hosts are mixed in current implementation; consolidating to one API origin is recommended.

## Authentication (Better Auth)

Auth is consumed through SDK calls instead of manually crafted `fetch` requests.

## Client operations used

- `authClient.signIn.email({ email, password })`
- `authClient.signUp.email({ email, password, name })`
- `authClient.useSession()`

Base URL configured in client:

- `https://api.saserver.hu/`

Cookie-based auth is reused for custom REST endpoints via `getAuthCookieHeader()`.

---

## REST Endpoints

## 1) Chat rooms

### GET /api/chat-rooms
- Host(s):
  - `https://cash.saserver.hu/api/chat-rooms`
  - `https://api.saserver.hu/api/chat-rooms` (also attempted in listing detail flow)
- Auth: Cookie header when available.
- Purpose: list chat rooms for current user.
- Expected response: `ChatRoom[]`

### POST /api/chat-rooms
- Host(s):
  - `https://api.saserver.hu/api/chat-rooms`
  - fallback/alternate host also attempted via list above.
- Auth: Cookie + `credentials: include`.
- Body:

```json
{
  "listingId": "string"
}
```

- Purpose: create or obtain a chat room tied to listing + participants.
- Expected response: either `ChatRoom` or `ChatRoom[]` (code handles both).

---

## 2) Listings

### GET /api/listings
- Host: `https://api.saserver.hu/api/listings`
- Auth: none in current code path.
- Purpose: public listing feed.
- Expected response: `Listing[]`

### GET /api/listings/my
- Host: `https://api.saserver.hu/api/listings/my`
- Auth: Cookie + `credentials: include`.
- Purpose: current user's own listings.
- Expected response: `Listing[]`

### GET /api/listings/saved
- Host: `https://api.saserver.hu/api/listings/saved`
- Auth: Cookie + `credentials: include`.
- Purpose: current user's saved listings.
- Expected response: `Listing[]`

### POST /api/listings
- Host: `https://api.saserver.hu/api/listings`
- Auth: Cookie when available.
- Body:

```json
{
  "title": "string",
  "description": "string",
  "category": "ELECTRONICS | FASHION | HOME | BOOKS | TOYS | SPORTS | OTHER",
  "price": 12345
}
```

- Purpose: create listing.
- Expected response: created listing object containing at least `id`.

### PATCH /api/listings/:listingId
- Host pattern: `https://api.saserver.hu/api/listings/{listingId}`
- Auth: Cookie + `credentials: include`.
- Body:

```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "price": 12345,
  "discountedPrice": 10000
}
```

- `discountedPrice` is optional.
- Purpose: update listing metadata.
- Expected response: updated `Listing`.

### POST /api/listings/:listingId/save
- Host pattern: `https://api.saserver.hu/api/listings/{listingId}/save`
- Auth: Cookie + `credentials: include`.
- Purpose: save/bookmark listing for current user.

### DELETE /api/listings/:listingId/save
- Same endpoint as above.
- Purpose: remove bookmark/saved state.

---

## 3) Pictures

### POST /api/pictures
- Host: `https://api.saserver.hu/api/pictures`
- Auth: Cookie when available (or include credentials in edit flow).
- Content-Type: multipart/form-data (`FormData`).
- Fields:
  - `listingId`: string
  - `file`: image blob/file
- Purpose: upload listing picture.

### DELETE /api/pictures/:pictureId
- Host pattern: `https://api.saserver.hu/api/pictures/{pictureId}`
- Auth: Cookie + `credentials: include`.
- Purpose: delete listing picture.

---

## 4) User profile

### POST /api/users/:userId/avatar
- Host pattern: `https://api.saserver.hu/api/users/{userId}/avatar`
- Auth: Cookie + `credentials: include`.
- Content-Type: multipart/form-data.
- Fields:
  - `file`: image blob/file
- Purpose: upload avatar.

### PATCH /api/users/:userId
- Host pattern: `https://api.saserver.hu/api/users/{userId}`
- Auth: Cookie + `credentials: include`.
- Body:

```json
{
  "name": "string"
}
```

- Purpose: update account profile data.

---

## Socket.IO Contract

Socket server base URL:

- `https://api.saserver.hu`

Connection options:

- `withCredentials: true`
- cookie header forwarded through `extraHeaders.Cookie`

## Client emits

### joinRoom

```json
{ "chatRoomId": "string" }
```

### leaveRoom

```json
{ "chatRoomId": "string" }
```

### sendMessage

```json
{
  "chatRoomId": "string",
  "content": "string"
}
```

### typing

```json
{
  "chatRoomId": "string",
  "isTyping": true
}
```

## Client listens

### connect
- No payload.
- Marks socket as connected.

### disconnect
- No payload.
- Clears typing indicators.

### error
- Payload: unknown error shape.
- Converted to string for UI state.

### messageHistory
- Payload: `Partial<ChatMessage>[]`
- Normalized into `ChatMessage[]`.

### newMessage
- Payload: `Partial<ChatMessage>`
- Appends if not duplicate by id.
- May trigger local notification.

### userTyping
- Payload:

```json
{
  "userId": "string",
  "userName": "string",
  "isTyping": true
}
```

---

## Data Shapes (Frontend Types)

Core interfaces used by REST/socket payloads are defined in `src/lib/interfaces.ts` and `src/lib/types.ts`:

- `User`
- `Listing`
- `ListingPicture`
- `Message`
- `ChatRoom`
- `ChatMessage`
- `TypingPayload`

---

## OpenAPI / Swagger Suggestion

For better backend-client alignment, publish an OpenAPI spec that includes:

- auth requirements (cookie session)
- request/response schemas for all endpoints above
- socket event payload contracts as supplemental docs

If OpenAPI is added later, this file should reference the generated spec URL and become a high-level consumer guide.
