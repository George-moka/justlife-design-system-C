import type { Meta, StoryObj } from '@storybook/react';
import { ServiceTileRow } from './ServiceTileRow';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { Box } from '../../primitives/Box';

const TILES = [
  { label: 'Home Cleaning', image: <PlaceholderImage seed="tile-clean" /> },
  { label: 'AC Maintenance', image: <PlaceholderImage seed="tile-ac" /> },
  { label: 'Handyman', image: <PlaceholderImage seed="tile-handy" /> },
  { label: 'Pest Control', image: <PlaceholderImage seed="tile-pest" /> },
];

const meta = {
  title: 'Components/ServiceTileRow',
  component: ServiceTileRow,
  args: {
    title: 'Popular services',
    tiles: TILES,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Horizontally-scrolling section of story tiles (Figma "Service Tile Row"). Section title above a scroll row of image + caption tiles.',
      },
    },
  },
} satisfies Meta<typeof ServiceTileRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Box background="primary" style={{ paddingVertical: 16, maxWidth: 375 }}>
      <ServiceTileRow {...args} />
    </Box>
  ),
};
