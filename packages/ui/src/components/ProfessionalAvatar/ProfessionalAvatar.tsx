import React from 'react';
import { View, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CategoryShape } from '../CategoryShape';
import { Icon } from '../Icon';
import type { ProfessionalAvatarProps } from './ProfessionalAvatar.types';

/** Native: square category shape with the professional's cutout photo layered on top. */
export function ProfessionalAvatar({ category, photo, size = 56, confirmed, label }: ProfessionalAvatarProps) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <CategoryShape category={category} size={size} label={label} />
      {photo ? (
        <Image
          source={{ uri: photo }}
          accessibilityLabel={label}
          resizeMode="contain"
          style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }}
        />
      ) : null}
      {confirmed ? (
        <View style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: t.background.primary, borderRadius: t.radius.pill }}>
          <Icon name="circle-check" size="sm" color={t.icon.brand} fill={t.background.primary} />
        </View>
      ) : null}
    </View>
  );
}
