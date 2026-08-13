import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { StarRating } from './StarRating';

const meta = {
  title: 'Components/StarRating',
  component: StarRating,
  parameters: {
    docs: {
      description: {
        component:
          'A row of stars — empty stars are soft grey, filled stars take the rating gold. Read-only by default; pass `onRate` to make it a tappable rating input (all grey until tapped).',
      },
    },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  render: () => (
    <View style={{ padding: 16, gap: 12 }}>
      <StarRating value={5} />
      <StarRating value={3} />
      <StarRating value={0} />
    </View>
  ),
};

/** Tappable — all grey until you rate, then fills to gold. */
export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState(0);
    return (
      <View style={{ padding: 16 }}>
        <StarRating value={rating} onRate={setRating} size="lg" />
      </View>
    );
  },
};
