import { Platform } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import type { Tokens } from '@justlife/tokens';

export type ElevationToken = Tokens['elevation'][keyof Tokens['elevation']];
export type TypographyToken = Tokens['typography'][keyof Tokens['typography']];

/**
 * Keys of a token group whose values are plain strings (e.g. colour tokens),
 * excluding nested sub-groups like `background.promo`. Used to constrain
 * token-key props to ones that resolve to a single value.
 */
export type StringKeyOf<T> = Extract<
  { [K in keyof T]: T[K] extends string ? K : never }[keyof T],
  string
>;

/**
 * Map a DTCG shadow token to a platform-appropriate style.
 * Web uses `boxShadow`; native uses the RN shadow props (+ Android elevation).
 */
export function elevationToStyle(shadow: ElevationToken): ViewStyle {
  const { color, offsetX, offsetY, blur } = shadow;
  if (Platform.OS === 'web') {
    return { boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}` } as unknown as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: 1,
    shadowRadius: blur,
    elevation: Math.max(0, Math.round(blur / 2)),
  };
}

/**
 * Native Poppins faces, keyed by the token's numeric weight. iOS can't reliably synthesize a weight
 * from one custom family, so each weight is a SEPARATELY-NAMED face; the native host app (Expo) must
 * load the matching `.ttf` under exactly these names (see `apps/prototype`). Web ignores this and uses
 * the CSS font stack + numeric weight instead.
 */
const NATIVE_POPPINS_BY_WEIGHT: Record<string, string> = {
  '400': 'Poppins-Regular',
  '500': 'Poppins-Medium',
  '600': 'Poppins-SemiBold',
};

/**
 * Map a composite typography token to a React Native text style.
 * Web uses the CSS font stack + numeric weight (the browser picks the face). Native maps the weight to
 * the matching named Poppins face and does NOT also set `fontWeight` (iOS would double-apply it).
 */
export function typographyToStyle(typo: TypographyToken): TextStyle {
  const base: TextStyle = {
    fontSize: typo.fontSize,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
  };
  return (
    Platform.select({
      web: { ...base, fontFamily: typo.fontFamily, fontWeight: typo.fontWeight as TextStyle['fontWeight'] },
      default: { ...base, fontFamily: NATIVE_POPPINS_BY_WEIGHT[String(typo.fontWeight)] ?? 'Poppins-Regular' },
    }) ?? base
  );
}
