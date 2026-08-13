import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';
import { Button, type ButtonVariant } from '../Button/Button';

export interface EmptyStateProps extends Omit<ViewProps, 'children'> {
  /** Muted Lucide glyph above the copy (decorative). */
  icon?: string;
  /** Icon colour. Defaults to the muted `icon.disabled`; `ErrorState` passes a slightly more present tone. */
  iconColor?: string;
  /** Primary line — what's empty. */
  title: React.ReactNode;
  /** Optional secondary line — what to do about it / when it'll fill. */
  description?: React.ReactNode;
  /** Optional action (e.g. "Browse services"). `variant` defaults to `primary`; calm states (errors,
   *  low-stakes prompts) often want `outline`/`secondary` so the single action doesn't shout. */
  action?: { label: string; onPress: () => void; icon?: string; variant?: ButtonVariant };
}

/**
 * **EmptyState** — a centred, low-emphasis placeholder for a list/screen with nothing in it yet: a muted
 * icon over a ghost title + hint, with an optional primary action. Deliberately quiet (tertiary text, a
 * disabled-tone icon) so it reads as "nothing here" rather than an error. The consumer owns vertical
 * placement (pass `style={{ paddingTop }}` to push it below a header); the component only centres its own
 * content. Promoted from the inline empty-state on the Bookings screen.
 */
export const EmptyState = forwardRef<ViewType, EmptyStateProps>(function EmptyState(
  { icon = 'inbox', iconColor, title, description, action, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <VStack
      ref={ref}
      gap="xs"
      align="center"
      style={[{ paddingHorizontal: t.space.lg }, style]}
      {...rest}
    >
      <Icon name={icon} size="xl" color={iconColor ?? t.icon.disabled} />
      <Text variant="labelBase" color="tertiary" align="center" style={{ marginTop: t.space.sm }}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyXSmall" color="tertiary" align="center">
          {description}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: t.space.md }}>
          {/* `xs` is the app's prevailing button size — `sm`/`md` read as chubby (AGENTS #7 / card-cta-xs). */}
          <Button size="xs" variant={action.variant ?? 'primary'} leftIcon={action.icon} onPress={action.onPress}>
            {action.label}
          </Button>
        </View>
      ) : null}
    </VStack>
  );
});
