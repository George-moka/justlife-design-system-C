import React from 'react';
import { Image as RNImage } from 'react-native';

const A = '@justlife/ui/src/assets/service-tiles/';
export const TILES: Record<string, any> = {
  'home-cleaning': require('@justlife/ui/src/assets/service-tiles/home-cleaning.webp'),
  'home-deep-cleaning': require('@justlife/ui/src/assets/service-tiles/home-deep-cleaning.webp'),
  'womens-salon': require('@justlife/ui/src/assets/service-tiles/womens-salon.webp'),
  'womens-spa': require('@justlife/ui/src/assets/service-tiles/womens-spa.webp'),
  'ac-cleaning': require('@justlife/ui/src/assets/service-tiles/ac-cleaning.webp'),
  'pest-control': require('@justlife/ui/src/assets/service-tiles/pest-control.webp'),
  'handyman': require('@justlife/ui/src/assets/service-tiles/handyman.webp'),
  'babysitting': require('@justlife/ui/src/assets/service-tiles/babysitting.webp'),
  'disinfection': require('@justlife/ui/src/assets/service-tiles/disinfection.webp'),
  'furniture-cleaning': require('@justlife/ui/src/assets/service-tiles/furniture-cleaning.webp'),
  'home-painting': require('@justlife/ui/src/assets/service-tiles/home-painting.webp'),
  'iv-therapy': require('@justlife/ui/src/assets/service-tiles/iv-therapy.webp'),
  'lab-tests': require('@justlife/ui/src/assets/service-tiles/lab-tests.webp'),
  'packers-movers': require('@justlife/ui/src/assets/service-tiles/packers-movers.webp'),
  'pet-grooming': require('@justlife/ui/src/assets/service-tiles/pet-grooming.webp'),
  'vet-at-home': require('@justlife/ui/src/assets/service-tiles/vet-at-home.webp'),
};

export function img(name: any, size = 64) {
  const src = typeof name === 'string' ? TILES[name] : null;
  if (!src) return undefined;
  return <RNImage source={src} style={{ width: size, height: size, borderRadius: 12 }} resizeMode="cover" />;
}
