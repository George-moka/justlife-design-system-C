import type { Meta, StoryObj } from '@storybook/react';
import { HStack } from '../../primitives/Stack';
import { StepIndicator } from './StepIndicator';

const meta = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  args: { current: 2, total: 4 },
  parameters: {
    docs: {
      description: {
        component:
          'Compact circular **step / progress** indicator — a track ring with a brand arc filled to `current/total` and the current step number centred. Built for tight spots like a `Header` title row (via its `aside` slot). Platform-split: raw SVG on web, react-native-svg on native. Everything tokenised.',
      },
    },
  },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Steps 1 → 4 — the arc fills as you advance. */
export const Progression: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <HStack gap="lg" align="center">
      {[1, 2, 3, 4].map((n) => (
        <StepIndicator key={n} current={n} total={4} />
      ))}
    </HStack>
  ),
};

/** Scales via `size`. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <HStack gap="lg" align="center">
      <StepIndicator current={2} total={4} size={20} />
      <StepIndicator current={2} total={4} size={28} />
      <StepIndicator current={2} total={4} size={40} />
    </HStack>
  ),
};
