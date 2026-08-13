import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { CategoryShape } from '../CategoryShape';
import { Icon } from '../Icon';
import type { ProfessionalAvatarProps } from './ProfessionalAvatar.types';

/** Web: square category shape with the professional's cutout photo layered on top. */
export function ProfessionalAvatar({ category, photo, size = 56, confirmed, label }: ProfessionalAvatarProps) {
  const t = useTheme();
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <CategoryShape category={category} size={size} label={label} />
      {photo ? (
        <img
          src={photo}
          alt={label ?? ''}
          width={size}
          height={size}
          draggable={false}
          style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, objectFit: 'contain' }}
        />
      ) : null}
      {confirmed ? (
        <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: t.background.primary, borderRadius: t.radius.pill, lineHeight: 0 }}>
          <Icon name="circle-check" size="sm" color={t.icon.brand} fill={t.background.primary} />
        </div>
      ) : null}
    </div>
  );
}
