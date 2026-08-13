import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import type { Tokens } from '@justlife/tokens';

export interface CardProps extends ViewProps {
  /** Shadow level from the elevation scale. */
  elevation?: keyof Tokens['elevation'];
  /** Apply the standard card padding. */
  padded?: boolean;
  /** Draw a hairline border. */
  bordered?: boolean;
  /** When provided, the whole card becomes pressable. */
  onPress?: () => void;
}

/** Surface container. Composes most list/detail layouts. */
export const Card = forwardRef<ViewType, CardProps>(function Card(
  { elevation = 'raised', padded = true, bordered = false, onPress, style, children, ...rest },
  ref,
) {
  const t = useTheme();
  const containerStyle = [
    { backgroundColor: t.background.surface, borderRadius: t.radius.card },
    padded && { padding: t.space.lg },
    bordered && { borderWidth: t.borderWidth.default, borderColor: t.border.default },
    elevationToStyle(t.elevation[elevation]),
    style,
  ];

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={containerStyle} {...rest}>
        {children}
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={containerStyle} {...rest}>
      {children}
    </View>
  );
});
