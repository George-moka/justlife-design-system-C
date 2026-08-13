import type { Meta, StoryObj } from '@storybook/react';
import { ProfessionalReplacementCard } from './ProfessionalReplacementCard';
import { VStack } from '../../primitives/Stack';

const HEAL = '/profile%20photos/profilepic_heal.png';

const meta = {
  title: 'Components/ProfessionalReplacementCard',
  component: ProfessionalReplacementCard,
  args: {
    category: 'heal',
    current: { name: 'Leila Mary', rating: 4.7, photo: HEAL, note: 'No longer available' },
    replacement: { name: 'Rihanna Karim', rating: 4.9, photo: HEAL, note: 'Your new professional' },
  },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Professional replacement card (Figma "Professional Replacement Card"). Current pro → swap arrow → replacement pro. A replacement is always within the **same service category**, so `category` is a single card-level prop shared by both pros. Current pro\'s sub-line is error red (the reason); the new pro\'s is primary. Omit `replacement` for the collapsed/locked state. Composes ProfessionalAvatar.',
      },
    },
  },
} satisfies Meta<typeof ProfessionalReplacementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Replacement: Story = { args: { onPress: () => {} } };

// Collapsed / locked — only the current pro + a brand chevron.
export const Locked: Story = {
  args: {
    category: 'heal',
    current: { name: 'Leila Mary', rating: 4.7, photo: HEAL, note: 'Finding a replacement…' },
    replacement: undefined,
    onPress: () => {},
  },
};

export const Both: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <VStack gap="md">
      <ProfessionalReplacementCard
        category="heal"
        current={{ name: 'Leila Mary', rating: 4.7, photo: HEAL, note: 'No longer available' }}
        replacement={{ name: 'Rihanna Karim', rating: 4.9, photo: HEAL, note: 'Your new professional' }}
        onPress={() => {}}
      />
      <ProfessionalReplacementCard
        category="heal"
        current={{ name: 'Leila Mary', rating: 4.7, photo: HEAL, note: 'Finding a replacement…' }}
        onPress={() => {}}
      />
    </VStack>
  ),
};
