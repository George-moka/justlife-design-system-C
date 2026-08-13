import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { type ButtonTone } from '../Button';
import { ProfessionalAvatar } from '../ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';

export interface ThankYouProfessional {
  name: string;
  rating?: string | number;
  /** Review count shown next to the rating, e.g. `12` → "(12)". */
  reviewCount?: string | number;
  /** Service vertical — selects the avatar's category shape. */
  category?: ServiceCategory;
  /** Professional photo URI (square cutout). */
  photo?: string;
  /** Custom avatar override; otherwise a category shape (or a fallback placeholder) is used. */
  avatar?: ReactNode;
}

export interface ThankYouAction {
  label: string;
  /** Lucide icon name, e.g. "calendar", "x", "phone". */
  icon?: string;
  /** Intent colour for the label + icon. Default `neutral`; brand is reserved for the title/identity,
   *  and `danger` (red) for the cancel-confirmation step, not the in-card Cancel. */
  tone?: ButtonTone;
  onPress?: () => void;
}

export interface ThankYouCardProps extends Omit<ViewProps, 'children'> {
  /** Brand headline / link, e.g. "Booking Confirmed". */
  title: string;
  /** Supporting message, e.g. "We'll share the professional's details before arrival.". */
  message: string;
  /** Makes the title a tappable link (adds a chevron). */
  onPress?: () => void;
  /** Trailing professional (avatar + rating + name). */
  professional?: ThankYouProfessional;
  /** Trailing illustration/status slot, used when there's no professional (e.g. "confirmed"). */
  illustration?: ReactNode;
  /** Pill action buttons shown below (e.g. Reschedule / Cancel). */
  actions?: ThankYouAction[];
}

const AVATAR = 56;

/**
 * Post-booking status card (Figma "Thank You Card"). A tappable brand title +
 * chevron, a supporting message, an optional trailing professional (or status
 * illustration), and an optional pill action bar. Adapted to the new DS — card
 * radius/padding and the professional block use our tokens + avatar pattern
 * rather than the Figma photo treatment. Every value is tokenised.
 */
export const ThankYouCard = forwardRef<ViewType, ThankYouCardProps>(function ThankYouCard(
  { title, message, onPress, professional, illustration, actions, style, ...rest },
  ref,
) {
  const t = useTheme();

  const titleRow = (
    <HStack align="center" gap="xs">
      <Text variant="bodyBase" color="brand" numberOfLines={1} style={{ flexShrink: 1 }}>
        {title}
      </Text>
      {onPress ? <Icon name="chevron-right" size="sm" color={t.icon.brand} /> : null}
    </HStack>
  );

  const proAvatar = professional?.avatar ??
    (professional?.category ? (
      <ProfessionalAvatar
        category={professional.category}
        photo={professional.photo}
        size={AVATAR}
        label={professional.name}
      />
    ) : (
      <View
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: t.radius.pill,
          backgroundColor: t.background.tertiary,
          borderWidth: t.borderWidth.hairline,
          borderColor: t.border.default,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Icon name="user" size="lg" color={t.icon.muted} />
      </View>
    ));

  // Avatar over the name, with the star rating + optional review count on its own line — the Figma
  // "Thank You Card" professional block.
  const trailing = professional ? (
    <VStack align="center" gap="xs" style={{ width: 80 }}>
      {proAvatar}
      <Text variant="labelXXSmall" color="brand" numberOfLines={1}>
        {professional.name}
      </Text>
      {professional.rating != null ? (
        <HStack gap="xs" align="center">
          <Icon name="star" size="xs" color={t.background.rating} fill={t.background.rating} />
          <Text variant="bodyMicro" color="primary">
            {String(professional.rating)}
          </Text>
          {professional.reviewCount != null ? (
            <Text variant="bodyMicro" color="secondary">
              ({String(professional.reviewCount)})
            </Text>
          ) : null}
        </HStack>
      ) : null}
    </VStack>
  ) : (
    illustration ?? null
  );

  return (
    <View
      ref={ref}
      style={[
        {
          width: '100%' as const,
          backgroundColor: t.background.surface,
          borderRadius: t.radius.default,
          paddingVertical: t.size['12'],
          paddingHorizontal: t.space.md,
          gap: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <HStack align="center" gap="sm">
        <VStack gap="xs" style={{ flex: 1 }}>
          {onPress ? (
            <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
              {titleRow}
            </Pressable>
          ) : (
            titleRow
          )}
          <Text variant="bodyXSmall" numberOfLines={3}>
            {message}
          </Text>
        </VStack>
        {trailing}
      </HStack>

      {actions && actions.length ? (
        <HStack gap="sm">
          {actions.map((a, i) => {
            // Recessed grey fill (`background.tertiary`) so the action reads as a button on the now-white
            // card surface — a plain `pill` (white) would be invisible. Label/icon take the intent tone.
            const tint = a.tone === 'danger' ? t.text.error : a.tone === 'brand' ? t.text.brand : t.text.primary;
            return (
              <Pressable
                key={`${a.label}-${i}`}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                onPress={a.onPress}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.space.xs,
                  minHeight: t.size['40'],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.background.tertiary,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                {a.icon ? <Icon name={a.icon} size="sm" color={tint} /> : null}
                <Text variant="labelMedium" style={{ color: tint }}>
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      ) : null}
    </View>
  );
});
