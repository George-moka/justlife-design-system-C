import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BottomNavigation, type BottomNavItem } from './BottomNavigation';
import { useTheme } from '../../theme/ThemeProvider';
import { VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const ITEMS: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check', badge: 3 },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

const meta = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  args: {
    items: ITEMS,
    activeKey: 'home',
    compact: false,
    floating: true,
  },
  argTypes: {
    activeKey: { control: 'radio', options: ITEMS.map((i) => i.key) },
    onTabPress: { action: 'tabPress' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Bottom navigation bar (Figma "Navigation Bar", evolved to the Instagram-style floating pattern). Icon + label tabs; the active tab gets a tinted pill (`tabbar.bg.active`), the brand icon colour (`tabbar.icon.active`) and a semibold label. Items can carry a count badge (number) or a dot (`true`). **`compact`** collapses the labels and shrinks the bar to a slim icon-only pill — an animated "shrink on scroll" (motion tokens) the screen drives from its scroll offset. `floating` (default) is the rounded shadowed pill; `floating={false}` docks it full-width with a top divider.',
      },
    },
  },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Isolated showcases opt out of the home-indicator inset (`safeAreaInset={0}`) so the pill sits
// flush in the catalog card; on a real screen the default reserves 34px below it (see ShrinkOnScroll).
export const Floating: Story = { args: { safeAreaInset: 0 } };

// Slim icon-only state — what the bar shrinks to while the feed is scrolling.
export const Compact: Story = { args: { compact: true, safeAreaInset: 0 } };

// Live: tapping a tab moves the highlight.
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState('home');
    return <BottomNavigation items={ITEMS} activeKey={active} onTabPress={setActive} safeAreaInset={0} />;
  },
};

// The Instagram behaviour: scroll the feed and the floating bar animates down to a slim
// icon-only pill; scroll back to the top and the labels expand again.
export const ShrinkOnScroll: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => {
    const t = useTheme();
    const [active, setActive] = useState('home');
    const [compact, setCompact] = useState(false);
    return (
      // Fill the viewport (absolute inset:0) so the nav reaches the real device bottom on a phone —
      // a fixed height would leave the bar floating mid-screen with blank space below it.
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.background.secondary }}>
        <ScrollView
          onScroll={(e) => setCompact(e.nativeEvent.contentOffset.y > 24)}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: t.space.md, paddingBottom: t.size['120'] }}
        >
          <Text variant="titleMedium" style={{ marginBottom: t.space.sm }}>
            Feed
          </Text>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={{
                height: t.size['80'],
                backgroundColor: t.background.primary,
                borderRadius: t.radius.default,
                borderWidth: t.borderWidth.hairline,
                borderColor: t.divider.color.default,
                marginBottom: t.space.sm,
                justifyContent: 'center',
                paddingHorizontal: t.space.md,
              }}
            >
              <Text variant="labelMedium" color="secondary">
                Post {i + 1}
              </Text>
            </View>
          ))}
        </ScrollView>
        {/* Anchored flush to the bottom — the bar carries its own home-indicator inset (34px). */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <BottomNavigation items={ITEMS} activeKey={active} onTabPress={setActive} compact={compact} />
        </View>
      </View>
    );
  },
};

// Full-width, docked to the bottom edge with a hairline top divider.
export const Docked: Story = {
  args: { floating: false, activeKey: 'bookings' },
  parameters: { layout: 'fullscreen' },
};

// Badge variants: a count pill, an over-max "9+", and a plain dot.
export const Badges: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <VStack gap="md">
      <Text variant="labelXSmall" color="secondary">
        Count · over-max (9+) · dot
      </Text>
      <BottomNavigation
        activeKey="home"
        safeAreaInset={0}
        items={[
          { key: 'home', label: 'Home', icon: 'house' },
          { key: 'bookings', label: 'Bookings', icon: 'calendar-check', badge: 3 },
          { key: 'wallet', label: 'Wallet', icon: 'wallet', badge: 24 },
          { key: 'profile', label: 'Profile', icon: 'user', badge: true },
        ]}
      />
    </VStack>
  ),
};

// Three tabs spread evenly.
export const ThreeTabs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <BottomNavigation
      activeKey="explore"
      safeAreaInset={0}
      items={[
        { key: 'explore', label: 'Explore', icon: 'compass' },
        { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
        { key: 'profile', label: 'Profile', icon: 'user' },
      ]}
    />
  ),
};
