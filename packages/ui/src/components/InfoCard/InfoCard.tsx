import React, { forwardRef } from 'react';
import { Pressable, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';
import type { Tokens } from '@justlife/tokens';

export type InfoTone = 'warning' | 'info' | 'success' | 'brand' | 'accent';

export interface InfoCardProps extends Omit<ViewProps, 'children'> {
  /** Message text. */
  children: React.ReactNode;
  tone?: InfoTone;
  /** Leading Lucide icon name. */
  icon?: string;
  showIcon?: boolean;
  /** Optional trailing tappable action (e.g. an "Update" link), right-aligned. */
  action?: { label: string; onPress: () => void };
}

function toneBackground(t: Tokens, tone: InfoTone): string {
  switch (tone) {
    case 'warning':
      return t.background.warningDefault;
    case 'success':
      return t.background.successDefault;
    case 'brand':
      return t.background.brandSubtle;
    case 'accent':
      return t.background.selected;
    case 'info':
    default:
      return t.background.infoDefault;
  }
}

/** Inline info banner (Figma Info Card). Tones: warning / info / success / brand / accent (a very
 *  light blue surface for friendly, non-status notices — distinct from the grey tappable rows). */
export const InfoCard = forwardRef<ViewType, InfoCardProps>(function InfoCard(
  { children, tone = 'info', icon = 'info', showIcon = true, action, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <HStack
      ref={ref}
      gap="sm"
      align="center"
      style={[
        {
          width: '100%',
          paddingHorizontal: t.space.md,
          paddingVertical: t.space.sm,
          borderRadius: t.radius.default,
          backgroundColor: toneBackground(t, tone),
        },
        style,
      ]}
      {...rest}
    >
      {showIcon ? <Icon name={icon} size="md" color={t.text.primary} /> : null}
      <Text variant="labelXSmall" style={{ flex: 1, color: t.text.primary }}>
        {children}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          hitSlop={t.space.sm}
        >
          <Text variant="labelBase" color="link">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </HStack>
  );
});
