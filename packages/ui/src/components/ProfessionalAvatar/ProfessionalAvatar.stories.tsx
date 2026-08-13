import type { Meta, StoryObj } from '@storybook/react';
import { ProfessionalAvatar } from './ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

// Sample professional photos served from apps/storybook/public (demo data only).
const PHOTOS: Record<ServiceCategory, string> = {
  clean: '/profile%20photos/profilepic_clean.png',
  heal: '/profile%20photos/profilepic_heal.png',
  care: '/profile%20photos/profilepic_care.png',
  assist: '/profile%20photos/profilepic_assist.png',
};

const meta = {
  title: 'Core/ProfessionalAvatar',
  component: ProfessionalAvatar,
  args: { category: 'clean', photo: PHOTOS.clean, size: 64 },
  parameters: {
    docs: {
      description: {
        component:
          'Square professional avatar: the service-category shape behind the professional\'s cutout photo. Photo is optional — without it, the coloured category shape is the placeholder. Photos stay square.',
      },
    },
  },
} satisfies Meta<typeof ProfessionalAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Categories: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      {(['clean', 'heal', 'care', 'assist'] as const).map((c) => (
        <VStack key={c} gap="xs" align="center">
          <ProfessionalAvatar category={c} photo={PHOTOS[c]} size={64} label={c} />
          <Text variant="labelXSmall">{c}</Text>
        </VStack>
      ))}
    </HStack>
  ),
};

// No photo → the colored category shape is the placeholder.
export const ShapeOnly: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      {(['clean', 'heal', 'care', 'assist'] as const).map((c) => (
        <ProfessionalAvatar key={c} category={c} size={64} label={c} />
      ))}
    </HStack>
  ),
};

export const Confirmed: Story = {
  args: { category: 'heal', photo: PHOTOS.heal, size: 64, confirmed: true },
};
