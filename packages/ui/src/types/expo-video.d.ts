// Minimal ambient types for `expo-video` so @justlife/ui typechecks the NATIVE funnel hero
// (`screens/hero-video.tsx`). The real module is provided at runtime by the Expo app (apps/prototype,
// SDK 54 — bundled in Expo Go) and resolved by Metro; web + tests use `hero-video.web.tsx` and never
// import this module. Only the surface the hero uses is declared.
declare module 'expo-video' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export interface VideoPlayer {
    loop: boolean;
    muted: boolean;
    play(): void;
    pause(): void;
  }

  /** Creates a player for `source`, running `setup` once the instance exists. */
  export function useVideoPlayer(source: string, setup?: (player: VideoPlayer) => void): VideoPlayer;

  export interface VideoViewProps extends ViewProps {
    player: VideoPlayer;
    /** How the frame fills the view — `cover` matches an image's `resizeMode="cover"`. */
    contentFit?: 'contain' | 'cover' | 'fill';
    nativeControls?: boolean;
    allowsPictureInPicture?: boolean;
    allowsFullscreen?: boolean;
  }
  export const VideoView: ComponentType<VideoViewProps>;
}
