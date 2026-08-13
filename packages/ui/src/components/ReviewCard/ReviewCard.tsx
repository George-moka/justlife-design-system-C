import React, { forwardRef, type ReactNode } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';

export interface ReviewCardMedia {
  /** Thumbnail image for the 96×96 slot. */
  image?: ReactNode;
  /** Renders a play overlay (video thumbnail). */
  video?: boolean;
}

export interface ReviewCardProps extends Omit<ViewProps, 'children'> {
  reviewerName: string;
  /** Rating shown in the star badge, e.g. "5.0". */
  rating: number | string;
  /** Meta line, e.g. "May 15, 2026 • For 1.5 hours". */
  meta?: string;
  /** Review body text. */
  review: string;
  /** Optional media thumbnails (photos/videos attached to the review). */
  media?: ReviewCardMedia[];
}

const THUMB = 96;

/**
 * Customer review block (Figma "Review Card", media none / single / multi).
 * Reviewer name + star rating badge, a meta line, the review text, and an
 * optional row of media thumbnails. Colours and type are tokenised.
 */
export const ReviewCard = forwardRef<ViewType, ReviewCardProps>(function ReviewCard(
  { reviewerName, rating, meta, review, media, style, ...rest },
  ref,
) {
  const t = useTheme();

  return (
    <VStack ref={ref} gap="xs" style={[{ width: '100%' }, style]} {...rest}>
      <HStack justify="space-between" align="center" gap="sm">
        <Text variant="titleSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
          {reviewerName}
        </Text>
        <Badge tone="rating" icon="star" iconFilled accessibilityLabel={`Rated ${rating}`}>
          {rating}
        </Badge>
      </HStack>

      {meta ? (
        <Text variant="bodyXSmall" color="tertiary">
          {meta}
        </Text>
      ) : null}

      <Text variant="bodyXSmall">{review}</Text>

      {media && media.length > 0 ? (
        <HStack gap="xs" wrap>
          {media.map((m, i) => (
            <View
              key={i}
              style={{
                width: THUMB,
                height: THUMB,
                borderRadius: t.radius.md,
                backgroundColor: t.background.tertiary,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {m.image}
              {m.video ? (
                <View style={{ position: 'absolute' }}>
                  <Icon name="play" size="md" color={t.icon.inverse} fill={t.icon.inverse} />
                </View>
              ) : null}
            </View>
          ))}
        </HStack>
      ) : null}
    </VStack>
  );
});
