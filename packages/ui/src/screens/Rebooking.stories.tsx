import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { RebookingSheet } from './rebooking-sheet';
import { Phone } from '../_dev/PhoneFrame';
import { useTheme } from '../theme/ThemeProvider';

/**
 * The **Book again** sheet — Home's "See all" destination (Figma `Bottomsheet → Rebooking`). Every
 * professional you've booked, filtered by service; each row is the same `BookAgainCard` Home shows in
 * its carousel, at full width.
 */
const meta = {
  title: 'Screens/Book Again Sheet',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

export const Default: StoryObj = {
  name: 'Book again',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <View style={{ flex: 1, backgroundColor: t.background.canvas }} />
        <RebookingSheet onClose={() => {}} onRebook={() => {}} />
      </Phone>
    );
  },
};
