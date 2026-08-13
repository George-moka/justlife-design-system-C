import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon/Icon';
import { Checkbox } from '../Checkbox/Checkbox';

export interface NotificationCardProps {
  title: string;
  body: string;
  time?: string;
  /** Shows the unread dot. */
  unread?: boolean;
  /** Avatar image for the trailing 40×40 slot. */
  avatar?: ReactNode;
  /** Trailing chevron (default true). */
  showChevron?: boolean;
  /** Leading selection checkbox. */
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Notification list card (Figma). Unread/Read, optional avatar, checkbox, chevron. */
export const NotificationCard = forwardRef<ViewType, NotificationCardProps>(function NotificationCard(
  {
    title,
    body,
    time,
    unread = false,
    avatar,
    showChevron = true,
    showCheckbox = false,
    checked,
    onCheckedChange,
    onPress,
    accessibilityLabel,
  },
  ref,
) {
  const t = useTheme();

  const card = (
    <HStack
      gap="sm"
      align="center"
      style={{
        flex: 1,
        backgroundColor: t.background.surface,
        borderRadius: t.radius.default,
        padding: t.space.sm,
      }}
    >
      <VStack gap="xs" style={{ flex: 1 }}>
        <HStack gap="sm" align="center">
          {unread ? (
            <View
              style={{ width: 6, height: 6, borderRadius: t.radius.pill, backgroundColor: t.text.error }}
            />
          ) : null}
          <Text variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Text>
          {time ? (
            <Text variant="labelXSmall" color="secondary">
              {time}
            </Text>
          ) : null}
          {showChevron ? <Icon name="chevron-right" size="sm" color={t.icon.secondary} /> : null}
        </HStack>
        <Text variant="bodyXSmall" color="secondary" numberOfLines={2}>
          {body}
        </Text>
      </VStack>
      {avatar ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: t.radius.pill,
            overflow: 'hidden',
            backgroundColor: t.avatar.bg.neutral,
            borderWidth: t.borderWidth.default,
            borderColor: t.border.default,
          }}
        >
          {avatar}
        </View>
      ) : null}
    </HStack>
  );

  return (
    <HStack gap="sm" align="center" style={{ width: '100%' }}>
      {showCheckbox ? (
        <Checkbox
          size="sm"
          checked={checked}
          onChange={onCheckedChange}
          accessibilityLabel="Select notification"
        />
      ) : null}
      {onPress ? (
        <Pressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          onPress={onPress}
          style={{ flex: 1 }}
        >
          {card}
        </Pressable>
      ) : (
        <View ref={ref} style={{ flex: 1 }}>
          {card}
        </View>
      )}
    </HStack>
  );
});
