import React, { forwardRef } from 'react';
import { Pressable, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { StatusBadge } from '../StatusBadge';

export interface PackageDetailsCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  description: string;
  /** Remaining-sessions pill text (e.g. "2 of 4 sessions left"). Hidden when expired. */
  remaining?: string;
  /** Lucide icon for the remaining pill. Default "calendar-clock". */
  remainingIcon?: string;
  state?: 'active' | 'expired';
  onPress?: () => void;
}

/**
 * Package summary row (Figma "Package Details Card"). Title + description, an optional
 * "remaining" pill (reuses `StatusBadge tone="info"`), and a disclosure chevron. The
 * `expired` state renders the title in the error colour and hides the remaining pill.
 * Every value is tokenised.
 */
export const PackageDetailsCard = forwardRef<ViewType, PackageDetailsCardProps>(function PackageDetailsCard(
  { title, description, remaining, remainingIcon = 'calendar-clock', state = 'active', onPress, style, ...rest },
  ref,
) {
  const t = useTheme();
  const expired = state === 'expired';

  const body = (
    <>
      <VStack gap="xs" style={{ flex: 1 }}>
        <Text variant="titleSmall" color={expired ? 'error' : 'primary'} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="bodyBase" color="secondary" numberOfLines={2}>
          {description}
        </Text>
        {!expired && remaining ? (
          <StatusBadge tone="info" icon={remainingIcon} style={{ alignSelf: 'flex-start' }}>
            {remaining}
          </StatusBadge>
        ) : null}
      </VStack>
      {onPress ? <Icon name="chevron-right" size="sm" color={t.icon.secondary} /> : null}
    </>
  );

  const containerStyle = [
    {
      width: '100%' as const,
      backgroundColor: t.background.surface,
      borderRadius: t.radius.default,
      padding: t.size['12'],
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [
          ...containerStyle,
          { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, opacity: pressed ? 0.95 : 1 },
        ]}
        {...rest}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <HStack ref={ref} align="center" gap="sm" style={containerStyle} {...rest}>
      {body}
    </HStack>
  );
});
