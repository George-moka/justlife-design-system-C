import type { Meta } from '@storybook/react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../primitives/Text';
import { VStack, HStack } from '../primitives/Stack';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

function Swatch({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <VStack gap="xs" style={{ width: 132 }}>
      <View
        style={{
          height: 48,
          borderRadius: t.radius.md,
          backgroundColor: value,
          borderWidth: t.size['1'],
          borderColor: t.border.default,
        }}
      />
      <Text variant="bodyXSmall">{label}</Text>
      <Text variant="bodyXSmall" color="tertiary">
        {value}
      </Text>
    </VStack>
  );
}

export const Colors = () => {
  const t = useTheme();
  const groups: Record<string, Record<string, unknown>> = {
    Background: t.background,
    Text: t.text,
    Border: t.border,
    Icon: t.icon,
  };
  return (
    <VStack gap="xl">
      {Object.entries(groups).map(([group, tokens]) => (
        <VStack key={group} gap="sm">
          <Text variant="titleLarge">{group}</Text>
          <HStack gap="md" wrap>
            {/* Only flat color strings can be rendered as swatches. Skip nested
                sub-groups (e.g. background.promo) so a malformed token can't
                crash the whole catalog page. */}
            {Object.entries(tokens)
              .filter(
                (entry): entry is [string, string] => typeof entry[1] === 'string',
              )
              .map(([name, value]) => (
                <Swatch key={name} label={name} value={value} />
              ))}
          </HStack>
        </VStack>
      ))}
    </VStack>
  );
};

export const Spacing = () => {
  const t = useTheme();
  return (
    <VStack gap="sm">
      <Text variant="titleLarge">Spacing scale</Text>
      {Object.entries(t.space).map(([name, value]) => (
        <HStack key={name} gap="md" align="center">
          <Text variant="bodyXSmall" style={{ width: 48 }}>
            {name}
          </Text>
          <View style={{ height: 16, width: value, backgroundColor: t.background.brandDefault }} />
          <Text variant="bodyXSmall" color="tertiary">
            {value}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};

export const Radius = () => {
  const t = useTheme();
  return (
    <HStack gap="lg" wrap>
      {Object.entries(t.radius).map(([name, value]) => (
        <VStack key={name} gap="xs" align="center">
          <View
            style={{
              height: 64,
              width: 64,
              borderRadius: value,
              backgroundColor: t.background.brandSubtle,
              borderWidth: t.size['1'],
              borderColor: t.border.brandDefault,
            }}
          />
          <Text variant="bodyXSmall">{name}</Text>
        </VStack>
      ))}
    </HStack>
  );
};
