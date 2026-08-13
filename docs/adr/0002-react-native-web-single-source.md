# 2. One component source via React Native + react-native-web

- Status: accepted
- Date: 2026-06-17

## Context

The Justlife apps are built with React Native. We must serve iOS, Android,
Mobile Web, and Desktop Web from a design system that is the single source of
truth, with mobile as the default priority.

## Decision

Author components once in **React Native primitives** and render to web with
**react-native-web**. Use React Native's platform-specific file extensions
(`.ios.tsx` / `.android.tsx` / `.web.tsx`) for genuine convention differences.
Design tokens are platform-agnostic (DTCG → Style Dictionary → CSS + TS).

## Consequences

- One implementation, four platforms; the RN apps consume the same components.
- Storybook uses `@storybook/react-vite` with a `react-native` → `react-native-web`
  alias; real React Native is never bundled on web.
- Some web/native rendering differences exist; mitigate with platform files and
  visual testing on each target.
- Teams shipping a separate React-DOM web surface consume **tokens** (CSS vars)
  rather than the RN components.
