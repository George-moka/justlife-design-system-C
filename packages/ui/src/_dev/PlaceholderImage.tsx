import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

/**
 * Dev-only placeholder photo for stories/examples (via picsum.photos, seeded so
 * each differs). NOT part of the public API and NOT a brand asset — real images
 * are supplied by the consumer through each component's image slot.
 */
export function PlaceholderImage({
  seed = 'justlife',
  style,
}: {
  seed?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={{ uri: `https://picsum.photos/seed/${encodeURIComponent(seed)}/120/120` }}
      resizeMode="cover"
      accessibilityLabel="placeholder image"
      style={[{ width: '100%', height: '100%' }, style]}
    />
  );
}
