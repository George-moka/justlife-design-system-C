import type { Meta, StoryObj } from '@storybook/react';
import { ProfessionalCard } from './ProfessionalCard';
import type { ServiceCategory } from '../CategoryShape';
import { HStack } from '../../primitives/Stack';

// Sample professional photos served from apps/storybook/public (demo data only).
const PHOTOS: Record<ServiceCategory, string> = {
  clean: '/profile%20photos/profilepic_clean.png',
  heal: '/profile%20photos/profilepic_heal.png',
  care: '/profile%20photos/profilepic_care.png',
  assist: '/profile%20photos/profilepic_assist.png',
};

const meta = {
  title: 'Components/ProfessionalCard',
  component: ProfessionalCard,
  args: { category: 'heal', name: 'Leila Mary', photo: PHOTOS.heal, rating: 4.7 },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Compact standalone professional chip (Figma "Professional Card"): category shape + cutout photo, a rating badge overlapping the avatar, and the name below. For professional lists / "choose your pro" rows. Composes ProfessionalAvatar; adapted to the new DS.',
      },
    },
  },
} satisfies Meta<typeof ProfessionalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// A "choose your professional" row across the four verticals.
export const ChooseYourPro: Story = {
  render: () => {
    const pros: { category: ServiceCategory; name: string; rating: number }[] = [
      { category: 'clean', name: 'Hussein', rating: 4.3 },
      { category: 'heal', name: 'Leila Mary', rating: 4.7 },
      { category: 'care', name: 'Sara', rating: 4.9 },
      { category: 'assist', name: 'Omar', rating: 4.5 },
    ];
    return (
      <HStack gap="md" align="center" wrap>
        {pros.map((p) => (
          <ProfessionalCard key={p.category} category={p.category} name={p.name} photo={PHOTOS[p.category]} rating={p.rating} onPress={() => {}} />
        ))}
      </HStack>
    );
  },
};

// No rating, no photo — the colored category shape is the placeholder.
export const ShapeOnly: Story = {
  args: { category: 'clean', name: 'Hussein', photo: undefined, rating: undefined },
};
