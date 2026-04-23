# Architecture

## High-level Overview

Buddy is an Expo + React Native application that uses:

- React Navigation for route orchestration.
- Better Auth client SDK for authentication/session state.
- NativeWind + shared UI primitives for styling.
- Tamagui provider for cross-platform design/runtime support.
- Socket.IO for real-time chat.
- Direct `fetch` calls for backend REST APIs.

The app is composition-first: screens orchestrate data fetching and UI composition, while reusable UI primitives live under `src/components/ui`.

## State Management

State management is intentionally lightweight and split by concern.

### 1. Authentication/session state

- Source of truth: `authClient.useSession()` from Better Auth.
- Used in:
  - Root auth gate (`RootNavigation`) to choose `Auth` vs `App` stack.
  - Pages that need current user context.
- Sign-in/sign-up are invoked via `authClient.signIn.email(...)` and `authClient.signUp.email(...)`.

### 2. UI and screen state

- Local component state with React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- Examples:
  - Listing filters/search/pagination states.
  - Form state in dialogs (sell listing, account settings).
  - Loading/error flags per screen.

There is currently no global Redux/Zustand store; state is colocated with screens/hooks where it is consumed.

### 3. Theme state

- Managed through `ThemeProvider` in `src/theme/ThemeContext.tsx`.
- Uses NativeWind's `useColorScheme()` under the hood.
- Exposes:
  - `colorScheme`
  - `toggleTheme()`
  - resolved color and radius tokens

### 4. Real-time chat state

- Encapsulated in `useChatSocket` hook.
- Maintains connection lifecycle and room/message state:
  - `isConnected`, `connectionError`
  - `joinedRoomId`
  - `messages`
  - `typingUsers`, `typingLabel`
- Handles Socket.IO events and emits join/send/typing events.

### 5. Notification state

- `useNotifications` initializes notification channel/permissions at app startup.
- Chat notifications are triggered from socket events when the incoming message is not from the current user and not in the currently joined room.

## Folder Strategy

The project uses a hybrid strategy that is mostly layer-based with feature pockets.

## Layers

- `src/components`: reusable UI and form components.
- `src/components/ui`: design-system-style primitives.
- `src/screens`: route-level UI containers.
- `src/screens/pages`: major app pages.
- `src/screens/dialogs`: modal/dialog features.
- `src/navigation`: navigation trees and route types.
- `src/hooks`: reusable behavior hooks (socket, notifications).
- `src/lib`: API clients, interfaces/types, helpers.
- `src/theme`: theme context and theme token objects.

## Feature pockets

Some screens/pages own feature-specific data orchestration (e.g., listing CRUD, chat room loading), while still reusing shared layers.

This balances implementation speed with maintainability:

- shared cross-app primitives stay centralized.
- feature workflows remain near their route containers.

## Navigation Handling

Navigation is stack-based with a root auth switch and nested stacks.

### Navigation tree

1. `NavigationContainer` wraps the app with a theme from `NAV_THEME`.
2. `RootNavigation` checks `authClient.useSession()`.
3. If authenticated -> `AppNavigation`; else -> `AuthNavigation`.
4. `HomeScreen` uses `PagerView` with three pages:
   - Listings page
   - Message stack (`MessageNavigation`)
   - Profile page

### Stack responsibilities

- `AuthNavigation`: login/register flow.
- `AppNavigation`: main app routes (home, listing detail, favorites, my listings, chat).
- `MessageNavigation`: chat room list + chat screen flow.

### Route typing

- Navigation params are typed (`routeTypes.ts`, stack param lists in each navigator).
- Chat routes pass `chatRoomId`, title, and users for room context.

## Architectural Notes and Trade-offs

- Pros:
  - Low complexity state model.
  - Strong co-location of behavior and UI.
  - Easy to onboard and modify screens quickly.
- Trade-offs:
  - Repeated fetch/auth-header patterns across screens.
  - No centralized API client layer yet.
  - Some base URL inconsistency between `api.saserver.hu` and `cash.saserver.hu` should be normalized.

## Suggested Next Evolution

- Introduce an API service layer under `src/lib/api` for:
  - base URL centralization
  - shared auth header handling
  - unified error parsing
- Add a server-state library (e.g., TanStack Query) if cache invalidation and refetch complexity grows.
- Keep `useChatSocket` as a dedicated realtime domain hook.
