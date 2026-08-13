import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Tokens } from '@justlife/tokens';

export interface StackProps extends ViewProps {
  direction?: 'row' | 'column';
  /** Space between children, from the spacing scale. */
  gap?: keyof Tokens['space'];
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  padding?: keyof Tokens['space'];
  wrap?: boolean;
  grow?: boolean;
}

/** Flex container with tokenised gap/padding. */
export const Stack = forwardRef<ViewType, StackProps>(function Stack(
  { direction = 'column', gap, align, justify, padding, wrap, grow, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        gap !== undefined && { gap: t.space[gap] },
        padding !== undefined && { padding: t.space[padding] },
        grow && { flexGrow: 1 },
        style,
      ]}
      {...rest}
    />
  );
});

export const HStack = forwardRef<ViewType, Omit<StackProps, 'direction'>>(function HStack(
  { gap = 'default', ...props },
  ref,
) {
  // DS rule: default horizontal spacing = 8px (space.default).
  return <Stack ref={ref} direction="row" gap={gap} {...props} />;
});

export const VStack = forwardRef<ViewType, Omit<StackProps, 'direction'>>(function VStack(props, ref) {
  return <Stack ref={ref} direction="column" {...props} />;
});
