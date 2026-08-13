import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';

export interface BookCardProfessional {
  name: string;
  rating: number | string;
  /** Avatar node for the 20×20 round slot. */
  avatar?: ReactNode;
}

export interface BookCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  /** Secondary line under the title (hidden in the `small` size by convention). */
  details?: string;
  price: string | number;
  /** Strikethrough original price. */
  oldPrice?: string | number;
  /** Currency label shown before the price. */
  currency?: string;
  /** Image for the leading square slot (76×76, or 48×48 when `size="small"`). */
  image?: ReactNode;
  /** `default` → 76px image; `small` → 48px image, compact row. */
  size?: 'default' | 'small';
  /** When set, renders the "With Professional" row (avatar · name · rating). */
  professional?: BookCardProfessional;
  onPress?: () => void;
}

/**
 * Horizontal booking card (Figma "Book Card", variants Default / Small / With
 * Professional). Leading image + title + optional details + optional
 * professional row + price. Colours and type are tokenised; spacing snaps to
 * the semantic `space` scale.
 */
export const BookCard = forwardRef<ViewType, BookCardProps>(function BookCard(
  {
    title,
    details,
    price,
    oldPrice,
    currency = 'AED',
    image,
    size = 'default',
    professional,
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const imageSize = size === 'small' ? 48 : 76;
  const showDetails = size !== 'small' && details != null;

  const content = (
    <>
      <View
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: t.radius.md,
          backgroundColor: t.background.tertiary,
          overflow: 'hidden',
        }}
      >
        {image}
      </View>
      <VStack gap="xs" style={{ flex: 1 }}>
        <Text variant="titleSmall" numberOfLines={1}>
          {title}
        </Text>
        {showDetails ? (
          <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        {professional ? (
          <HStack gap="xs" align="center">
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: t.radius.pill,
                backgroundColor: t.background.tertiary,
                borderWidth: t.borderWidth.default,
                borderColor: t.border.default,
                overflow: 'hidden',
              }}
            >
              {professional.avatar}
            </View>
            <Text variant="labelXSmall">{professional.name}</Text>
            <Icon name="star" size="sm" color={t.background.rating} fill={t.background.rating} label="rating" />
            <Text variant="labelXSmall">{professional.rating}</Text>
          </HStack>
        ) : null}
        <HStack gap="xs" align="center">
          <Text variant="bodyBase">
            {currency} {price}
          </Text>
          {oldPrice != null ? (
            <Text variant="bodyXSmall" color="secondary" style={{ textDecorationLine: 'line-through' }}>
              {currency} {oldPrice}
            </Text>
          ) : null}
        </HStack>
      </VStack>
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
        onPress={onPress}
        style={({ pressed }) => [
          ...containerStyle,
          { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, opacity: pressed ? 0.95 : 1 },
        ]}
        {...rest}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <HStack ref={ref} align="center" gap="sm" style={containerStyle} {...rest}>
      {content}
    </HStack>
  );
});
