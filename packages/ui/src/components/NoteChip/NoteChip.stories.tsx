import type { Meta, StoryObj } from '@storybook/react';
import { NoteChip } from './NoteChip';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/NoteChip',
  component: NoteChip,
  args: { children: "Don't ring the bell", icon: 'bell-off' },
  argTypes: { onChange: { action: 'changed' } },
  parameters: {
    docs: { description: { component: 'Selectable chip (Figma Note Chip). Toggles between default and selected.' } },
  },
} satisfies Meta<typeof NoteChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="md" wrap>
      <NoteChip icon="bell-off">Don&apos;t ring the bell</NoteChip>
      <NoteChip icon="bell-off" defaultSelected>
        Don&apos;t ring the bell
      </NoteChip>
      <NoteChip icon="dog">Pet at home</NoteChip>
    </HStack>
  ),
};
