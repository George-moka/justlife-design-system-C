import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, ScrollView, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';

export interface ServiceTileRowItem {
  label: string;
  /** Image node for the 160×80 tile slot. */
  image?: ReactNode;
  onPress?: () => void;
}

export interface ServiceTileRowProps extends Omit<ViewProps, 'children'> {
  title: string;
  tiles: ServiceTileRowItem[];
}

const TILE_WIDTH = 160;
const IMAGE_HEIGHT = 80;

/**
 * Horizontally-scrolling section of "story" tiles (Figma "Service Tile Row").
 * A section title above a scroll row of image + caption tiles. Colours, type
 * and radii are tokenised; tile dimensions follow the Figma geometry.
 */
export const ServiceTileRow = forwardRef<ViewType, ServiceTileRowProps>(function ServiceTileRow(
  { title, tiles, style, ...rest },
  ref,
) {
  const t = useTheme();

  return (
    <VStack ref={ref} gap="sm" style={[{ width: '100%' }, style]} {...rest}>
      <View style={{ paddingHorizontal: t.space.md }}>
        <Text variant="labelBase">{title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.md }}
      >
        {tiles.map((tile, i) => {
          const content = (
            <VStack
              gap="sm"
              align="center"
              style={{
                width: TILE_WIDTH,
                borderRadius: t.radius.md,
                backgroundColor: t.background.promo.tile,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: TILE_WIDTH,
                  height: IMAGE_HEIGHT,
                  borderRadius: t.radius.md,
                  backgroundColor: t.background.tertiary,
                  overflow: 'hidden',
                }}
              >
                {tile.image}
              </View>
              <Text variant="bodyXSmall" align="center" numberOfLines={1} style={{ width: TILE_WIDTH }}>
                {tile.label}
              </Text>
            </VStack>
          );

          return tile.onPress ? (
            <Pressable key={i} accessibilityRole="button" accessibilityLabel={tile.label} onPress={tile.onPress}>
              {content}
            </Pressable>
          ) : (
            <View key={i}>{content}</View>
          );
        })}
      </ScrollView>
    </VStack>
  );
});
