import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { MiniActionCard } from './MiniActionCard';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/MiniActionCard',
  component: MiniActionCard,
  parameters: {
    docs: {
      description: {
        component:
          'A slim, equal-height action tile for a row (e.g. a Voucher + Wallet pair). Default state shows a caption + link; the applied state (set `value`) shows the value + a ✕ in the selected treatment.',
      },
    },
  },
} satisfies Meta<typeof MiniActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The voucher + wallet pair, with the voucher togglable between default and applied. */
export const VoucherAndWallet: Story = {
  render: () => {
    const [code, setCode] = useState<string>('');
    return (
      <View style={{ padding: 16 }}>
        <HStack gap="sm" align="stretch">
          <MiniActionCard
            label="Voucher Code"
            action="Add"
            onPress={() => setCode('JL-WELCOME20')}
            value={code || undefined}
            onRemove={() => setCode('')}
            removeLabel="Remove voucher"
          />
          <MiniActionCard label="No Available Credit" action="Details" onPress={() => {}} />
        </HStack>
      </View>
    );
  },
};

/** Applied state on its own. */
export const Applied: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <HStack gap="sm" align="stretch">
        <MiniActionCard label="Voucher Code" value="JL-WELCOME20" onRemove={() => {}} removeLabel="Remove voucher" />
      </HStack>
    </View>
  ),
};
