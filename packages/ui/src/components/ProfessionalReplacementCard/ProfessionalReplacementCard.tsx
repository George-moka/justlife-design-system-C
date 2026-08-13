import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { ProfessionalAvatar } from '../ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';

export interface ReplacementPro {
  name: string;
  rating?: string | number;
  photo?: string;
  /** Sub-line under the name (reason for the current pro, info for the replacement). */
  note?: string;
}

export interface ProfessionalReplacementCardProps extends Omit<ViewProps, 'children'> {
  /** Service vertical — shared by both pros. Replacements are always within the same category. */
  category: ServiceCategory;
  /** The current/old professional — `note` renders in the error colour. */
  current: ReplacementPro;
  /** The replacement professional — `note` renders in the primary colour. Omit → collapsed
   *  ("locked") state: only the current pro + a brand chevron. */
  replacement?: ReplacementPro;
  onPress?: () => void;
}

/**
 * Professional replacement card (Figma "Professional Replacement Card"). Shows the
 * current professional, a swap arrow, then the replacement — each row is an avatar +
 * name + rating + a sub-line (the current pro's reason in error red, the new pro's info
 * in primary). Omitting `replacement` gives the collapsed/locked state. Every value is
 * tokenised; composes `ProfessionalAvatar`.
 */
export const ProfessionalReplacementCard = forwardRef<ViewType, ProfessionalReplacementCardProps>(
  function ProfessionalReplacementCard({ category, current, replacement, onPress, style, ...rest }, ref) {
    const t = useTheme();

    const row = (pro: ReplacementPro, noteColor: 'error' | 'primary') => (
      <HStack align="center" gap="sm">
        <ProfessionalAvatar category={category} photo={pro.photo} size={40} label={pro.name} />
        <VStack style={{ flex: 1, gap: t.size['2'] }}>
          <HStack align="center" style={{ gap: t.size['6'] }}>
            <Text variant="labelXSmall" color="brand" numberOfLines={1} style={{ flexShrink: 1 }}>
              {pro.name}
            </Text>
            {pro.rating != null ? (
              <Badge tone="rating" icon="star" iconFilled accessibilityLabel={`Rated ${pro.rating}`} style={{ alignSelf: 'center' }}>
                {String(pro.rating)}
              </Badge>
            ) : null}
          </HStack>
          {pro.note ? (
            <Text variant="bodyMicro" color={noteColor}>
              {pro.note}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    );

    const content = (
      <>
        {row(current, 'error')}
        {/* Swap indicator, centred under the avatar column. */}
        <HStack align="center">
          <View style={{ width: 40, alignItems: 'center' }}>
            <Icon
              name={replacement ? 'arrow-down' : 'chevron-down'}
              size="sm"
              color={replacement ? t.icon.secondary : t.icon.brand}
            />
          </View>
        </HStack>
        {replacement ? row(replacement, 'primary') : null}
      </>
    );

    const containerStyle = [
      {
        width: '100%' as const,
        backgroundColor: t.background.surface,
        borderRadius: t.radius.default,
        padding: t.size['12'],
        gap: t.space.sm,
      },
      style,
    ];

    if (onPress) {
      return (
        <Pressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={`${current.name}${replacement ? ` replaced by ${replacement.name}` : ''}`}
          onPress={onPress}
          style={({ pressed }) => [...containerStyle, { opacity: pressed ? 0.95 : 1 }]}
          {...rest}
        >
          {content}
        </Pressable>
      );
    }

    return (
      <View ref={ref} style={containerStyle} {...rest}>
        {content}
      </View>
    );
  },
);
