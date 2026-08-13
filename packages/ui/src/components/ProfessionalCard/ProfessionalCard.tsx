import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';
import { Badge } from '../Badge';
import { ProfessionalAvatar } from '../ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';

export interface ProfessionalCardProps extends Omit<ViewProps, 'children'> {
  /** Service vertical — selects the avatar's category shape. */
  category: ServiceCategory;
  name: string;
  /** Professional photo URI (square cutout). */
  photo?: string;
  /** Rating shown in a star badge overlapping the avatar. */
  rating?: string | number;
  /** Avatar size in px. Default 64. */
  size?: number;
  onPress?: () => void;
}

/**
 * Compact standalone professional chip (Figma "Professional Card"): the category
 * shape behind the cutout photo, a rating badge overlapping the avatar, and the
 * name below. Use in professional lists / "choose your pro" rows. Every value is
 * tokenised; composes `ProfessionalAvatar`.
 */
export const ProfessionalCard = forwardRef<ViewType, ProfessionalCardProps>(function ProfessionalCard(
  { category, name, photo, rating, size = 64, onPress, style, ...rest },
  ref,
) {
  const t = useTheme();

  const body = (
    <VStack align="center" gap="xs">
      <View style={{ position: 'relative', marginBottom: rating != null ? t.size['6'] : undefined }}>
        <ProfessionalAvatar category={category} photo={photo} size={size} label={name} />
        {rating != null ? (
          <View style={{ position: 'absolute', bottom: -t.size['6'], left: 0, right: 0, alignItems: 'center' }}>
            <Badge tone="rating" icon="star" iconFilled accessibilityLabel={`Rated ${rating}`} style={{ alignSelf: 'center' }}>
              {String(rating)}
            </Badge>
          </View>
        ) : null}
      </View>
      <Text variant="labelXSmall" color="brand" numberOfLines={1}>
        {name}
      </Text>
    </VStack>
  );

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={onPress}
        style={[{ alignItems: 'center' }, style]}
        {...rest}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={[{ alignItems: 'center' }, style]} {...rest}>
      {body}
    </View>
  );
});
