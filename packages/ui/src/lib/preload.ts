import { Image } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Warm a set of bundled images so a screen can wait for its artwork instead of popping it in.
 *
 * Static `require`d assets are not free: in a dev build Metro serves them over HTTP, and even bundled
 * they still have to be decoded — so a feed made of 3D icons and photography paints its boxes first and
 * fills them a beat later, which reads as broken rather than loading. `Image.resolveAssetSource` gives
 * each module a URI that `Image.prefetch` can pull into the cache; by the time the screen renders for
 * real, the images are already there.
 */
export function preloadImages(sources: number[]): Promise<void> {
  const uris = sources
    .map((s) => {
      try {
        return Image.resolveAssetSource(s)?.uri;
      } catch {
        return undefined;
      }
    })
    .filter(Boolean) as string[];
  return Promise.all(uris.map((u) => Image.prefetch(u).catch(() => false))).then(() => undefined);
}

/**
 * `false` until `sources` are warm — or until `timeoutMs` passes, because a screen must never be held
 * hostage by an image that will not load. Hosts show their skeleton while this is `false`.
 */
export function useImagesReady(sources: number[], timeoutMs = 1500): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => alive && setReady(true);
    preloadImages(sources).then(done, done);
    const bail = setTimeout(done, timeoutMs);
    return () => {
      alive = false;
      clearTimeout(bail);
    };
    // Deliberately mount-only: the caller passes a module-id list that is stable for the screen's life,
    // and re-running on a new array identity would restart the wait on every render.
  }, []);
  return ready;
}
