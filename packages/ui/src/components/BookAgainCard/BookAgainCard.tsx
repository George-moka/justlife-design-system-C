import React, { forwardRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Badge } from '../Badge';
import { Icon } from '../Icon';
import { CategoryShape, type ServiceCategory } from '../CategoryShape';

/**
 * Width ÷ height of the exported cut-out (180 × 291 @3x). The photo's HEIGHT is derived from it, so a
 * new export can only ever be framed by re-exporting into the same box — never by nudging a number here.
 */
const PHOTO_ASPECT = 180 / 291;

export interface BookAgainPro {
  /** Professional's name. */
  name: string;
  /** The service they last performed ("Home Cleaning"). */
  service: string;
  /** Recency line ("Last served on Nov 14, 2025"). */
  lastServed: string;
  /** Drives the brand shape standing behind the photo. */
  category: ServiceCategory;
  /** Cut-out photo — a transparent asset framed to the shared slot. */
  photo?: ImageSourcePropType;
  /** Star rating; omit to hide the rating tag. */
  rating?: string | number;
  /** Times booked; omit to hide the "Booked Nx" tag. */
  bookedCount?: number;
  /** Shows the "Instant is available" tag. */
  instant?: boolean;
}

export interface BookAgainCardProps extends Omit<ViewProps, 'children'> {
  pro: BookAgainPro;
  /** Fixed width — Home's carousel card. Omit to fill the row (the rebooking sheet). */
  width?: number;
  onPress?: () => void;
  /** Renders the favourite control on the name row. */
  onFavorite?: () => void;
  favorite?: boolean;
  /** Renders the share control on the name row. */
  onShare?: () => void;
}

/**
 * **Book Again card** (Figma "Cards → Book Again"). A professional you've booked before: the brand
 * category shape with their cut-out photo standing in front of it, then name, service, when they last
 * served you, and how often you've booked them.
 *
 * The photo is the whole trick — a transparent cut-out DELIBERATELY taller than the card, so the head
 * clears the shape and the body is cropped by the card's own bottom edge. So the card clips, and the
 * photo is positioned rather than centred. Framing lives in the ASSET (every cut-out is exported into
 * one box): in Figma each card had a hand-placed photo (60×97, 73×108, 61×93, 70×105) and no two sat
 * alike, which is exactly the kind of drift a component should make impossible.
 */
export const BookAgainCard = forwardRef<ViewType, BookAgainCardProps>(function BookAgainCard(
  { pro, width, onPress, onFavorite, favorite = false, onShare, style, ...rest },
  ref,
) {
  const t = useTheme();
  const [pressed, setPressed] = useState(false);
  const column = t.size['72'];
  const photoW = t.size['64'];
  const shape = t.size['56'];

  return (
    <View
      ref={ref}
      style={[
        {
          width,
          height: t.size['80'],
          borderRadius: t.radius.default,
          // ONE fill for both homes. Figma's `#FBFAF7` works in the sheet, whose surface is white — but
          // it IS the page canvas, so on Home the card vanished into the feed. `tertiary` clears both
          // surfaces and matches the service tiles the card sits under on Home.
          backgroundColor: t.background.tertiary,
          // The photo overruns the card top and bottom — the card is what crops it.
          overflow: 'hidden',
          opacity: pressed ? 0.7 : 1,
        },
        style as object,
      ]}
      {...rest}
    >
      {/* The rebook target sits UNDER the content rather than wrapping it: favourite and share are
          buttons too, and a button inside a button is invalid (and unreachable for a screen reader). */}
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Book ${pro.name} again`}
          onPress={onPress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.md,
          paddingHorizontal: t.size['12'],
        }}
      >
        <View style={{ width: column, height: '100%' }}>
          <View style={{ position: 'absolute', left: (column - shape) / 2, top: t.size['10'] }}>
            <CategoryShape category={pro.category} size={shape} />
          </View>
          {pro.photo ? (
            <Image
              source={pro.photo}
              resizeMode="contain"
              style={{
                position: 'absolute',
                left: (column - photoW) / 2,
                top: t.size['6'],
                width: photoW,
                height: photoW / PHOTO_ASPECT,
              }}
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>

        <VStack gap="xs" style={{ flex: 1 }}>
          <HStack align="center" gap="xs">
            <Text variant="labelXSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
              {pro.name}
            </Text>
            {pro.rating != null ? (
              <Badge
                tone="rating"
                icon="star"
                iconFilled
                accessibilityLabel={`Rated ${pro.rating}`}
                style={{ alignSelf: 'center' }}
              >
                {pro.rating}
              </Badge>
            ) : null}
            {onFavorite || onShare ? (
              <HStack gap="xs" align="center" style={{ marginLeft: 'auto' }}>
                {onFavorite ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      favorite
                        ? `Remove ${pro.name} from favourites`
                        : `Add ${pro.name} to favourites`
                    }
                    onPress={onFavorite}
                    hitSlop={t.space.sm}
                  >
                    <Icon
                      name="heart"
                      size="sm"
                      color={favorite ? t.icon.error : t.icon.primary}
                      fill={favorite ? t.icon.error : 'none'}
                    />
                  </Pressable>
                ) : null}
                {onShare ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Share ${pro.name}`}
                    onPress={onShare}
                    hitSlop={t.space.sm}
                  >
                    <Icon name="share" size="sm" color={t.icon.primary} />
                  </Pressable>
                ) : null}
              </HStack>
            ) : null}
          </HStack>

          <HStack align="flex-end" gap="xs">
            <VStack style={{ flex: 1 }}>
              <Text variant="bodyMicro" numberOfLines={1}>
                {pro.service}
              </Text>
              <Text variant="bodyMicro" color="secondary" numberOfLines={1}>
                {pro.lastServed}
              </Text>
            </VStack>
            {pro.bookedCount != null ? (
              <Badge
                tone="success"
                style={{ alignSelf: 'flex-end' }}
              >{`Booked ${pro.bookedCount}x`}</Badge>
            ) : null}
          </HStack>

          {pro.instant ? (
            <Badge
              tone="instant"
              icon="instant-bolt"
              style={{ alignSelf: 'flex-start', paddingHorizontal: t.space.xs }}
            >
              Instant is available
            </Badge>
          ) : null}
        </VStack>
      </View>
    </View>
  );
});
