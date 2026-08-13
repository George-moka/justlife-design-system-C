import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface PromiseListItem {
  title: string;
  desc: string;
}

export interface PromiseListProps {
  /** The reassurance points (title + description), shown centred under the seal. */
  items: PromiseListItem[];
  /** Heading under the seal (e.g. "justlife Promise"). Rendered pale, tone-on-tone. */
  title?: string;
  /** Lucide icon for the centred seal. Defaults to a shield-check. */
  seal?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * **PromiseList** — the booking funnel's "justlife Promise": a quiet, centred reassurance block that sits
 * **tone-on-tone with the paper**. A faint single-tone seal (the softest element) over a pale heading and
 * centred `title + description` pairs in soft greys — each a flat single tone, no emphasis, so the block
 * whispers reassurance without competing with the cards above. Paleness steps down: titles → heading → seal.
 */
export function PromiseList({ items, title, seal = 'shield-check', style }: PromiseListProps) {
  const t = useTheme();
  return (
    <VStack gap="md" style={[{ alignItems: 'center', paddingHorizontal: t.space.lg }, style]}>
      {/* The seal is the faintest mark on the page — a flat single tone, then faded with opacity so it sits
          a clear step softer than the heading below it. */}
      <View style={{ opacity: t.opacity['40'] }}>
        <Icon name={seal} size="xl" color={t.icon.disabled} />
      </View>
      {title ? (
        <Text variant="titleMedium" align="center" color="tertiary">
          {title}
        </Text>
      ) : null}
      <VStack gap="md" style={{ alignItems: 'center' }}>
        {items.map((r) => (
          <VStack key={r.title} gap="xs" style={{ alignItems: 'center' }}>
            <Text variant="labelBase" color="secondary" align="center">
              {r.title}
            </Text>
            <Text variant="bodyXSmall" color="tertiary" align="center">
              {r.desc}
            </Text>
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}
