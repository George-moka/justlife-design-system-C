import type { Meta, StoryObj } from '@storybook/react';
import { ReviewCard } from './ReviewCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { VStack } from '../../primitives/Stack';

const REVIEW =
  'Excellent service! The team was professional, friendly, and left the house spotless. Highly recommend their work.';

const meta = {
  title: 'Components/ReviewCard',
  component: ReviewCard,
  args: {
    reviewerName: 'Sarah M.',
    rating: '5.0',
    meta: 'May 15, 2026 • For 1.5 hours - without material',
    review: REVIEW,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Customer review block (Figma "Review Card"). Reviewer name + star rating badge, meta line, review text, and an optional row of media thumbnails (none / single / multi).',
      },
    },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Media: Story = {
  render: () => (
    <VStack gap="lg">
      <ReviewCard reviewerName="Sarah M." rating="5.0" meta="May 15, 2026 • For 1.5 hours" review={REVIEW} />
      <ReviewCard
        reviewerName="Omar K."
        rating="4.5"
        meta="May 12, 2026 • Deep cleaning"
        review={REVIEW}
        media={[{ image: <PlaceholderImage seed="rev1" /> }]}
      />
      <ReviewCard
        reviewerName="Leila A."
        rating="5.0"
        meta="May 10, 2026 • AC maintenance"
        review={REVIEW}
        media={[
          { image: <PlaceholderImage seed="rev2" /> },
          { image: <PlaceholderImage seed="rev3" />, video: true },
          { image: <PlaceholderImage seed="rev4" /> },
        ]}
      />
    </VStack>
  ),
};
