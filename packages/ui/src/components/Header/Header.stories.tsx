import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useState } from 'react';
import { Header } from './Header';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * A token-built UAE flag for the country-selector slot. The flag colours are real DS tokens
 * (`icon.flagGreen/flagWhite/flagRed` + `color.base.black`), mirroring the Figma `Header` flag
 * artwork — so nothing here is off-token. Any country flag node can be passed instead.
 */
function UaeFlag() {
  const t = useTheme();
  return (
    <View style={{ width: t.size['24'], height: t.size['24'], flexDirection: 'row' }}>
      <View style={{ width: t.size['8'], backgroundColor: t.color.base.black }} />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: t.icon.flagGreen }} />
        <View style={{ flex: 1, backgroundColor: t.icon.flagWhite }} />
        <View style={{ flex: 1, backgroundColor: t.color.base.black }} />
      </View>
    </View>
  );
}

const meta = {
  title: 'Components/Header',
  component: Header,
  args: {
    title: 'Home Cleaning',
    step: { current: 1, total: 4 },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Compact funnel header (Figma `Header`, evolved to the denser redesign). A single title row — back chevron, title, trailing action icons and an optional country-flag selector — with a slim segmented step-progress bar under the title. `collapsed` scroll-collapses it (the progress bar folds away, padding tightens) using the `motion` tokens. Built to sit at the top of a layered `PageShell` header.',
      },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Home-cleaning funnel, Step 1 — inline title + 4-segment progress bar + a favourite heart.
export const FunnelStep: Story = {
  args: {
    title: 'Home Cleaning',
    step: { current: 1, total: 4 },
    actions: [{ icon: 'heart', accessibilityLabel: 'Save to favourites', tone: 'danger', filled: true }],
    onBack: () => {},
  },
};

// Later step — the filled segments track progress.
export const FunnelStep3: Story = {
  args: {
    title: 'Date & Time',
    step: { current: 3, total: 4 },
    onBack: () => {},
  },
};

// Collapsed (scroll-collapsed) — progress bar folded away, tighter padding.
export const Collapsed: Story = {
  args: {
    title: 'Home Cleaning',
    step: { current: 1, total: 4 },
    actions: [{ icon: 'heart', accessibilityLabel: 'Save to favourites', tone: 'danger', filled: true }],
    collapsed: true,
    onBack: () => {},
  },
};

// Salon flex funnel bar — search + favourite trailing icons, no step bar (lives over media in PageShell).
export const FlexFunnel: Story = {
  args: {
    title: "Women's Salon",
    step: undefined,
    actions: [
      { icon: 'search', accessibilityLabel: 'Search services' },
      { icon: 'heart', accessibilityLabel: 'Save to favourites' },
    ],
    onBack: () => {},
  },
};

// Canonical homepage header — title + country-flag selector (Figma "Show Country Selection").
export const WithCountryFlag: Story = {
  args: {
    title: 'Select Payment Method',
    step: undefined,
    flag: <UaeFlag />,
    onFlagPress: () => {},
    onBack: () => {},
  },
};

// Interactive: tap the button to toggle the scroll-collapse.
export const ToggleCollapse: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <View>
        <Header {...args} collapsed={collapsed} onBack={() => setCollapsed((c) => !c)} />
      </View>
    );
  },
  args: {
    title: 'Home Cleaning',
    step: { current: 2, total: 4 },
    actions: [{ icon: 'heart', accessibilityLabel: 'Save to favourites', tone: 'danger', filled: true }],
  },
};
