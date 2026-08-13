import React from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { HeroVideoProps } from './hero-video.types';

/**
 * Native funnel hero — the service's CDN loop, playing muted and looping behind the header. Web uses
 * `hero-video.web.tsx` (a plain `<video>` element).
 *
 * Silent and chrome-less on purpose: it's a background, not a player. No controls, no PiP, no audio
 * session takeover — starting one would duck the user's music for a decorative loop.
 */
export function HeroVideo({ source, backgroundColor }: HeroVideoProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={{ flex: 1, backgroundColor, overflow: 'hidden' }}>
      <VideoView
        style={{ flex: 1 }}
        player={player}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        allowsFullscreen={false}
      />
    </View>
  );
}
