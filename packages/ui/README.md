# @justlife/ui

The Justlife component library. Components are authored once in **React Native
primitives** and render to web via **react-native-web**, so a single
implementation serves iOS, Android, Mobile Web, and Desktop Web.

## Usage

```tsx
import { ThemeProvider, Button, Card, Text, VStack } from '@justlife/ui';

export function App() {
  return (
    <ThemeProvider themeName="light">
      <Card>
        <VStack gap="md">
          <Text variant="h3">Premium Cleaning</Text>
          <Button onPress={book}>Book now</Button>
        </VStack>
      </Card>
    </ThemeProvider>
  );
}
```

## What's inside (Phase 0)

- **Theme:** `ThemeProvider`, `useTheme`, `useThemeName`, `useStyles`,
  `elevationToStyle`, `typographyToStyle`.
- **Hooks:** `useBreakpoint`, `useResponsiveValue`.
- **Primitives:** `Box`, `Stack` / `HStack` / `VStack`, `Text`.
- **Components:** `Icon`, `Button`, `Input`, `Card`.

> This is the original Phase-0 snapshot. The library has grown well past it — **~86 components** plus shared
> screens (Funnel, Thank You, Profile, Bookings, Onboarding, Wallet). For the **current** catalog, see Storybook
> (`pnpm --filter @justlife/storybook dev`) or the exports in [`src/index.ts`](src/index.ts).

## Rules

- **Tokens only.** No raw colours or dimensions — the `no-raw-values` lint rule
  enforces this. Use `@justlife/tokens` via `useTheme()`.
- **Platform variants** go in `Component.web.tsx` / `.ios.tsx` / `.android.tsx`.
- Every component ships **stories**, **MDX docs**, and **tests**. Scaffold with
  `pnpm new:component`.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm --filter @justlife/ui test` | Unit + a11y tests (Vitest + RNW + jest-axe) |
| `pnpm --filter @justlife/ui typecheck` | Type-check the library |
