import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { SwipeToDelete } from './SwipeToDelete';
import { QuantityStepper } from '../QuantityStepper';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Components/SwipeToDelete',
  component: SwipeToDelete,
  parameters: {
    docs: {
      description: {
        component:
          'A list row that hides a destructive action behind it. Drag the row left — or open it from a control — and a red delete button is revealed; the row is only removed when that is pressed.',
      },
    },
  },
} satisfies Meta<typeof SwipeToDelete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Revealed, so the action is visible without a gesture (drag works too). */
export const Revealed: Story = {
  args: { open: true, deleteLabel: 'Remove Gel Mani-Pedi', onDelete: () => {} },
  render: (args) => {
    const t = useTheme();
    return (
      <View style={{ padding: t.space.md, backgroundColor: t.background.canvas }}>
        <SwipeToDelete {...args} style={{ backgroundColor: t.background.secondary }}>
          <HStack justify="space-between" align="center" style={{ padding: t.space.sm, backgroundColor: t.background.secondary }}>
            <Text variant="labelBase">Gel Mani-Pedi</Text>
            <Text variant="labelXSmall" color="secondary">
              AED 149
            </Text>
          </HStack>
        </SwipeToDelete>
      </View>
    );
  },
};

/**
 * The basket case: the stepper's minus doesn't delete. At a quantity of 1 it asks the row to open, so
 * removal always costs a second, deliberate press — swiping the row gets you to the same place.
 */
export const BasketLines: Story = {
  parameters: { controls: { disable: true } },
  args: { deleteLabel: '', onDelete: () => {} },
  render: () => {
    const t = useTheme();
    const [lines, setLines] = useState([
      { key: 'a', name: 'Polish-Free Mani-Pedi', price: 99, qty: 1 },
      { key: 'b', name: 'Gel Mani & Classic Pedi', price: 149, qty: 2 },
    ]);
    const [open, setOpen] = useState<string | null>(null);
    return (
      <View style={{ padding: t.space.md, backgroundColor: t.background.canvas }}>
        {/* The panel rounds and clips; the ROWS carry the horizontal padding, so a row can slide its
            full width instead of being cut at a padding edge. */}
        <VStack style={{ backgroundColor: t.background.secondary, borderRadius: t.radius.default, overflow: 'hidden' }}>
          {lines.map((l) => (
            <SwipeToDelete
              key={l.key}
              open={open === l.key}
              onOpenChange={(o) => setOpen(o ? l.key : null)}
              onDelete={() => setLines((cur) => cur.filter((c) => c.key !== l.key))}
              deleteLabel={`Remove ${l.name}`}
              radius={0}
              rowBackground={t.background.secondary}
            >
              <HStack
                justify="space-between"
                align="center"
                gap="sm"
                style={{
                  paddingVertical: t.space.sm,
                  paddingHorizontal: t.space.md,
                  backgroundColor: t.background.secondary,
                }}
              >
                <VStack style={{ flex: 1 }}>
                  <Text variant="labelBase" numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Text variant="labelXSmall" color="secondary">{`AED ${l.price}`}</Text>
                </VStack>
                <QuantityStepper
                  size="sm"
                  value={l.qty}
                  min={1}
                  onRequestRemove={() => setOpen(l.key)}
                  onChange={(q) => {
                    // Adding again answers the reveal's question with "no" — so it closes the row.
                    if (open === l.key) setOpen(null);
                    setLines((cur) => cur.map((c) => (c.key === l.key ? { ...c, qty: q } : c)));
                  }}
                />
              </HStack>
            </SwipeToDelete>
          ))}
        </VStack>
      </View>
    );
  },
};
