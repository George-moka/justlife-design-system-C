import React from 'react';
import { View } from 'react-native';
import type { HeroVideoProps } from './hero-video.types';

/**
 * Web funnel hero — a plain `<video>` element, since react-native-web has no video primitive and the
 * native module (`expo-video`) must never be bundled for web/tests. Mirrors `hero-video.tsx`.
 */
export function HeroVideo({ source, backgroundColor }: HeroVideoProps) {
  return (
    <View style={{ flex: 1, backgroundColor, overflow: 'hidden' }}>
      {React.createElement('video', {
        src: source,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
      })}
    </View>
  );
}
