import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { PlanSelectCard } from './PlanSelectCard';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Components/PlanSelectCard',
  component: PlanSelectCard,
  parameters: {
    docs: {
      description: {
        component:
          'A vertical selectable plan card (title + optional discount badge + radio, divider, bullets, optional expansion). Composes `SelectableCard`. Used for the booking funnel’s frequency choice.',
      },
    },
  },
} satisfies Meta<typeof PlanSelectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FrequencyPlans: Story = {
  render: () => {
    const t = useTheme();
    const [plan, setPlan] = useState('recurring');
    return (
      <View style={{ padding: t.space.md, gap: t.space.md }}>
        <PlanSelectCard
          selected={plan === 'onetime'}
          onPress={() => setPlan('onetime')}
          title="One Time"
          bullets={['Book a single visit', 'No commitment']}
        />
        <PlanSelectCard
          selected={plan === 'recurring'}
          onPress={() => setPlan('recurring')}
          title="Recurring"
          discount="Save up to 25%"
          popular
          bullets={['Same professional guaranteed', 'Pause or cancel anytime']}
        />
        <PlanSelectCard
          selected={plan === 'monthly'}
          onPress={() => setPlan('monthly')}
          title="Monthly"
          bullets={['Best value for regular cleaning']}
        />
      </View>
    );
  },
};
