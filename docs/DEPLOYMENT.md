# Deployment (EAS)

## Overview

This project is configured for Expo Application Services (EAS) with profiles defined in `eas.json`:

- `development`: dev client + internal distribution
- `preview`: internal distribution
- `production`: store-ready profile with auto-increment

EAS project id is set in `app.json` under `expo.extra.eas.projectId`.

## Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Install EAS CLI (if not already installed):

```bash
npm install -g eas-cli
```

3. Login to Expo:

```bash
eas login
```

4. Ensure you are in the project root where `app.json` and `eas.json` exist.

## Build Profiles

Current `eas.json` summary:

- `development`
  - `developmentClient: true`
  - `distribution: internal`
- `preview`
  - `distribution: internal`
- `production`
  - `autoIncrement: true`

## Build Commands

## Development builds

Android:

```bash
eas build --platform android --profile development
```

iOS:

```bash
eas build --platform ios --profile development
```

## Preview builds (internal testing)

Android:

```bash
eas build --platform android --profile preview
```

iOS:

```bash
eas build --platform ios --profile preview
```

## Production builds

Android:

```bash
eas build --platform android --profile production
```

iOS:

```bash
eas build --platform ios --profile production
```

## Build both platforms in one command

```bash
eas build --platform all --profile production
```

## Submitting to Stores

`eas.json` contains a `submit.production` section, so you can submit with:

Android:

```bash
eas submit --platform android --profile production
```

iOS:

```bash
eas submit --platform ios --profile production
```

## Versioning Notes

- App version in `app.json`: `expo.version`.
- With `production.autoIncrement: true`, EAS increments build/version codes automatically on production builds.

## Useful Operational Commands

View builds:

```bash
eas build:list
```

Inspect a build:

```bash
eas build:view
```

Pull remote env vars (if used in your EAS project):

```bash
eas env:pull
```

## Troubleshooting Checklist

1. Verify Expo account and project ownership (`eas whoami`).
2. Confirm bundle/application identifiers:
   - iOS: `com.cashflow.buddy`
   - Android: `com.cashflow.buddy`
3. Check credentials setup in Expo dashboard if signing fails.
4. Re-run with clear profile selection and platform flags.
5. Review build logs in EAS dashboard for native dependency issues.

## Recommended Release Flow

1. Create `preview` builds for QA/internal validation.
2. Validate auth, listing CRUD, chat, notifications on real devices.
3. Create `production` build.
4. Submit via `eas submit` after final checks.
