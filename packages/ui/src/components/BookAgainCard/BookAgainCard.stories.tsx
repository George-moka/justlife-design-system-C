import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { BookAgainCard } from './BookAgainCard';
import { VStack } from '../../primitives/Stack';
import { useTheme } from '../../theme/ThemeProvider';
import { REBOOKING_PROS } from '../../screens/rebooking-sheet';

const meta = {
  title: 'Components/BookAgainCard',
  component: BookAgainCard,
  parameters: {
    docs: {
      description: {
        component:
          "A professional you've booked before (Figma \"Cards → Book Again\"): the vertical's brand shape with their cut-out photo standing in front of it, name, service, when they last served you and how often you've booked them. Used by Home's carousel at a fixed 260 and by the rebooking sheet at full width.",
      },
    },
  },
  args: { pro: REBOOKING_PROS[0] },
} satisfies Meta<typeof BookAgainCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full width — the rebooking sheet's row. */
export const Default: Story = {
  render: (args) => {
    const t = useTheme();
    return (
      <View style={{ padding: t.space.md, backgroundColor: t.background.canvas }}>
        <BookAgainCard {...args} />
      </View>
    );
  },
};

/** Home's carousel card: a fixed 260 wide, with the "Instant is available" tag. */
export const HomeCarousel: Story = {
  args: { pro: { ...REBOOKING_PROS[0], instant: true }, width: 260 },
  render: (args) => {
    const t = useTheme();
    return (
      <View style={{ padding: t.space.md, backgroundColor: t.background.canvas }}>
        <BookAgainCard {...args} />
      </View>
    );
  },
};

/** Every vertical — the shape behind the photo is the service's own colour. */
export const EveryVertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const t = useTheme();
    return (
      <VStack gap="sm" style={{ padding: t.space.md, backgroundColor: t.background.canvas }}>
        {REBOOKING_PROS.map((pro) => (
          <BookAgainCard key={pro.key} pro={pro} onFavorite={() => {}} onShare={() => {}} />
        ))}
      </VStack>
    );
  },
};
