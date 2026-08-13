import React, { type ReactNode } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface DisclaimerProps {
  /** Leading icon (Lucide name). Default `shield-check`. */
  icon?: string;
  /** The disclaimer text. */
  children: ReactNode;
  /** Optional trailing link (e.g. "Details"). */
  action?: { label: string; onPress: () => void };
}

/**
 * **Disclaimer** — a low-emphasis, **neutral** inline callout: a leading icon, small text, and an optional
 * trailing link. Grey (`background.tertiary`) on purpose — it's reference/reassurance copy (free
 * cancellation, terms, fees), not a coloured alert. For a coloured, attention-drawing notice use `InfoCard`;
 * for transient feedback use `Toast`.
 */
export function Disclaimer({ icon = 'shield-check', children, action }: DisclaimerProps) {
  const t = useTheme();
  return (
    <HStack
      gap="sm"
      align="center"
      style={{
        paddingHorizontal: t.space.md,
        paddingVertical: t.space.sm,
        borderRadius: t.radius.default,
        backgroundColor: t.background.tertiary,
      }}
    >
      <Icon name={icon} size="md" color={t.icon.secondary} />
      <Text variant="labelXSmall" style={{ flex: 1, color: t.text.primary }}>
        {children}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          hitSlop={t.space.sm}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="labelXSmall" color="link">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </HStack>
  );
}
