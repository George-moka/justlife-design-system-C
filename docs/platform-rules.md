# Platform rules

Mobile app experiences (iOS, Android) are the **default priority**. Mobile Web
and Desktop Web are first-class. One component implementation serves all four via
react-native-web.

## When to create a platform variant

Create a `Component.ios.tsx` / `.android.tsx` / `.web.tsx` (or branch with
`Platform.select`) **only** when a platform convention genuinely differs:

| Area | iOS | Android | Web |
| --- | --- | --- | --- |
| Navigation | Back swipe, large titles | Up affordance, FAB | URL/history, hover |
| Date/time pickers | Wheel / sheet | Material dialog | Native input + popover |
| Bottom sheets | Detents, grabber | Material sheet | Modal/drawer fallback |
| Modals | Card/sheet styles | Full-screen dialogs | Centered dialog + overlay |
| Form controls | Native look/keyboard | Material fields | Native inputs + focus rings |
| Gestures | Swipe back/long-press | Ripple, long-press | Pointer + keyboard |
| Keyboard | `KeyboardAvoidingView` | Adjust-resize | Tab order, Enter/Esc |

Default: **don't** split. Shared behaviour stays in `Component.tsx`.

## Rules

1. Document any platform difference in the component's MDX (Platform notes).
2. Keep the public prop API identical across platforms.
3. Always meet the minimum touch target (`touchTarget.min` = 44px).
4. Verify in Storybook across the iPhone, Pixel, iPad, and Desktop viewports and
   in both light and dark themes.
5. Web must be keyboard accessible (focus order, visible focus, Enter/Esc).
