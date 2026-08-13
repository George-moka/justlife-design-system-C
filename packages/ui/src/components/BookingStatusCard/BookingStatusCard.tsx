import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { ProfessionalAvatar } from '../ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';

export interface BookingStatusProfessional {
  name: string;
  rating: number | string;
  /** Service vertical — selects the avatar's category shape. */
  category?: ServiceCategory;
  /** Professional photo URI (square cutout). */
  photo?: string;
  /** Custom avatar override; otherwise a category shape (or a fallback placeholder) is used. */
  avatar?: ReactNode;
  /** Shows a check overlay (e.g. the Confirmed state). */
  confirmed?: boolean;
}

export interface BookingStatusCardProps extends Omit<ViewProps, 'children'> {
  /** Status headline, e.g. "Professional Assigned", "On the Way". */
  status: string;
  /** Supporting message, e.g. "We'll arrive between 13.00-14.00.". */
  message: string;
  /** Cancelled state — renders the status in the error colour. */
  cancelled?: boolean;
  /** Assigned professional block (avatar · name · rating). Omit when none. */
  professional?: BookingStatusProfessional;
  onPress?: () => void;
}

const AVATAR = 56;

/**
 * Booking status card (Figma "Booking Status Card"). A status headline +
 * chevron with a supporting message, plus an optional professional block
 * (avatar, name, rating badge). The status is brand-coloured, or error when
 * cancelled. Colours and type are tokenised.
 */
export const BookingStatusCard = forwardRef<ViewType, BookingStatusCardProps>(function BookingStatusCard(
  { status, message, cancelled = false, professional, onPress, style, ...rest },
  ref,
) {
  const t = useTheme();
  const statusColor = cancelled ? t.text.error : t.text.brand;

  const body = (
    <>
      <VStack gap="sm" style={{ flex: 1 }}>
        <HStack gap="xs" align="center">
          <Text variant="titleSmall" numberOfLines={1} style={{ color: statusColor, flexShrink: 1 }}>
            {status}
          </Text>
          <Icon name="chevron-right" size="sm" color={statusColor} />
        </HStack>
        <Text variant="bodyBase" numberOfLines={2}>
          {message}
        </Text>
      </VStack>

      {professional ? (
        <VStack gap="xs" align="center" style={{ maxWidth: 88 }}>
          {professional.avatar ??
            (professional.category ? (
              <ProfessionalAvatar
                category={professional.category}
                photo={professional.photo}
                size={AVATAR}
                confirmed={professional.confirmed}
                label={professional.name}
              />
            ) : (
              <View
                style={{
                  width: AVATAR,
                  height: AVATAR,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.background.tertiary,
                  borderWidth: t.borderWidth.default,
                  borderColor: t.border.default,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="user" size="lg" color={t.icon.muted} />
              </View>
            ))}
          <Text variant="labelXSmall" color="brand" numberOfLines={1}>
            {professional.name}
          </Text>
          <Badge tone="rating" icon="star" iconFilled accessibilityLabel={`Rated ${professional.rating}`}>
            {professional.rating}
          </Badge>
        </VStack>
      ) : null}
    </>
  );

  const containerStyle = [
    {
      width: '100%' as const,
      backgroundColor: t.background.surface,
      borderRadius: t.radius.default,
      padding: t.space.sm,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={status}
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
