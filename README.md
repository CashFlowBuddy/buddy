# Buddy

Buddy is an Expo React Native marketplace/chat app with:

- Email auth (Better Auth)
- Listing browse/create/edit/save flows
- Realtime chat (Socket.IO)
- Push/local chat notifications
- NativeWind + reusable UI primitives
- Tamagui provider integration

## Tech Stack

- React Native + Expo
- TypeScript
- React Navigation (native stack)
- Better Auth (`better-auth`, `@better-auth/expo`)
- NativeWind + Tailwind CSS
- Tamagui
- Socket.IO client

## Project Docs

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- API contracts: [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md)
- Style guide: [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)
- Deployment (EAS): [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Requirements

- Node.js 18+
- npm
- Expo tooling (`npx expo ...`)
- EAS CLI for cloud builds (`npm i -g eas-cli`)

## Install

```bash
npm install
```

## Run Locally

Start Expo:

```bash
npx expo start
```

Run native targets:

```bash
npm run android
npm run ios
```


## App Architecture (Short)

- Root auth gate chooses Auth stack vs App stack based on session.
- Home uses pager-based layout (listings, messages, profile).
- Screen-level local state for forms/loading/errors.
- Dedicated realtime state through `useChatSocket`.
- Theme state through `ThemeProvider` + NativeWind color scheme.

See full details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Folder Layout (Short)

```text
src/
	components/          # reusable components
	components/ui/       # design-system primitives
	screens/             # route screens
	screens/pages/       # major pages
	screens/dialogs/     # dialog flows
	navigation/          # stack setup and route typing
	hooks/               # reusable hooks (socket, notifications)
	lib/                 # auth client, interfaces, helpers
	theme/               # theme context and tokens
```

## Backend Integration

- Auth SDK base URL points to `https://api.saserver.hu/`
- REST endpoints are consumed via `fetch`
- Realtime chat uses Socket.IO

For endpoint-level details, payloads, and socket events, see [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md).

## Styling System

- Semantic Tailwind tokens in [global.css](global.css)
- Utility-first classes with NativeWind
- Variant-driven primitives in [src/components/ui](src/components/ui)

Guidelines are documented in [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md).

## Deployment

EAS build profiles are configured in [eas.json](eas.json):

- `development`
- `preview`
- `production`

Build and submit commands are documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Useful Commands

```bash
npx expo start
npm run android
npm run ios
```

## Notes

- The app currently uses cookie-based session auth for protected endpoints.
- If you change backend domains or endpoint paths, update both API call sites and [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md).
