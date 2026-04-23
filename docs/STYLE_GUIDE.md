# Style Guide

## Overview

This project uses a hybrid styling system:

- NativeWind (Tailwind utility classes) for component-level styling.
- Shared UI primitives in `src/components/ui` built with `class-variance-authority` (`cva`) + `cn` helper.
- Global design tokens via CSS variables in `global.css`.
- Tamagui provider in `App.tsx` for compatibility/extensibility.

The preferred approach is token-driven, utility-first, and variant-based.

## Design Tokens

Primary source of color/radius tokens:

- `global.css` CSS variables (`--background`, `--primary`, `--radius`, etc.).
- Tailwind maps these via `hsl(var(--token))` in `tailwind.config.js`.
- `ThemeContext` and reusable JS theme objects mirror these values for runtime usage.

## Rule

Do not hardcode random hex values in feature components unless the value is:

- image/brand-specific content, or
- impossible to express with existing tokens.

Prefer semantic tokens such as:

- `bg-background`, `text-foreground`
- `border-border`, `bg-card`
- `text-muted-foreground`

## Component Authoring Guidelines

## 1) Use shared primitives first

Before creating custom UI, check if a primitive exists in `src/components/ui`:

- button, input, label, card, avatar, dialog, select, separator, text, etc.

## 2) Use variants instead of ad-hoc class branching

When a component supports visual modes, define variants with `cva`.

Example pattern used in `Button`:

- `variant`: `default | destructive | outline | secondary | ghost | link`
- `size`: `default | sm | lg | icon`

## 3) Merge class names via `cn(...)`

Use the helper from `src/lib/utils.ts`:

- `clsx` for conditional classes
- `tailwind-merge` for conflict resolution

## 4) Keep text semantics with `Text` variants

Use `Text` component variants (`h1`, `h2`, `small`, `muted`, etc.) instead of arbitrary typography classes when possible.

## Theming and Color Scheme

- NativeWind color mode is the runtime source (`useColorScheme`).
- `ThemeProvider` exposes `toggleTheme()` and resolved tokens.
- React Navigation theme is synchronized through `NAV_THEME` in `src/lib/theme.ts`.

When creating new screens:

1. Use semantic color utility classes.
2. Ensure both light/dark compatibility.
3. Avoid assumptions like black text on white background.

## Spacing, Radius, and Layout

- Prefer consistent spacing scale (`gap-*`, `px-*`, `py-*`, `mt-*`, etc.).
- Use semantic rounded classes mapped to `--radius` (`rounded-md`, etc.).
- Respect safe areas (`SafeAreaView`) for top-level screens.

## Interaction and Accessibility

- Buttons and touchables should expose clear pressed/disabled states.
- Inputs should have labels and meaningful placeholders.
- Keep keyboard UX in mind (`returnKeyType`, `onSubmitEditing`, keyboard providers).
- Preserve readable contrast for all token combinations.

## Responsive / Platform Considerations

Some classes are platform-specific in shared primitives via `Platform.select`:

- Web focus-visible styles
- Hover behavior on web only

When adding styles:

- avoid relying on hover-only interactions for mobile-critical actions.
- test on both native and web targets if component is cross-platform.

## Do and Don't

## Do

- Build from existing primitives.
- Use semantic tokens.
- Extend component variants for reusable visual patterns.
- Keep feature components focused on composition and behavior.

## Don't

- Duplicate base button/input/card styling in feature files.
- Hardcode one-off colors where token equivalents exist.
- Mix multiple typography strategies in one component.
- Introduce a parallel styling system without team agreement.

## Suggested Workflow for New UI

1. Compose with `src/components/ui` primitives.
2. Add/extend `cva` variants if needed.
3. Use `cn` for conditional styling.
4. Verify dark/light mode.
5. Verify mobile interaction states.
