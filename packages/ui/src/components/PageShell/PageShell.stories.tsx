import type { Meta, StoryObj } from '@storybook/react';
import { ScrollView, View } from 'react-native';
import { PageShell } from './PageShell';
import { Header } from '../Header';
import { Card } from '../Card';
import { Text } from '../../primitives/Text';
import { RadialGlow } from '../../primitives/RadialGlow';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * The funnel header "aurora" band — a token-built reproduction of `header-gradient.svg`: a warm
 * paper base (`background.paper`) with a soft brand-blue glow top-left and a soft coral glow
 * (`color.red.400`) bottom-right, both fading to transparent. Rendered with the `RadialGlow` primitive.
 */
function HeaderAurora() {
  const t = useTheme();
  return (
    <RadialGlow
      style={{ flex: 1 }}
      baseColor={t.background.paper}
      glows={[
        { color: t.background.brandDefault, x: '30%', y: '25%', opacity: 0.12, radius: '55%' },
        { color: t.color.red['400'], x: '84%', y: '95%', opacity: 0.14, radius: '55%' },
      ]}
    />
  );
}

/** A simple block of demo content so the card has something to scroll. */
function DemoContent() {
  const t = useTheme();
  return (
    <View style={{ padding: t.space.md, gap: t.space.md }}>
      <Text variant="titleMedium">How many hours do you need your professional to stay?</Text>
      {['Frequency', 'Professionals', 'Materials', 'Instructions', 'Summary', 'More options'].map((label) => (
        <Card key={label}>
          <View style={{ padding: t.space.md, gap: t.size['4'] }}>
            <Text variant="labelBase">{label}</Text>
            <Text variant="bodyXSmall" color="secondary">
              Scroll the screen — the gradient band fades and parallaxes away, then the header collapses.
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

/** Horizontal category-chips slider used as the sticky row (salon flex pattern). */
function ChipRow() {
  const t = useTheme();
  const chips = ['Bestsellers', 'Bundles', 'Nails', 'Hair Removal', 'Facial', 'Hair', 'Henna', 'Massage'];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: t.space.md, paddingVertical: t.size['8'], gap: t.size['8'] }}
      style={{ borderBottomWidth: t.borderWidth.hairline, borderBottomColor: t.divider.color.default }}
    >
      {chips.map((c, i) => (
        <View
          key={c}
          style={{
            paddingHorizontal: t.space.md,
            paddingVertical: t.size['8'],
            borderRadius: t.radius.pill,
            borderWidth: t.borderWidth.thin,
            borderColor: i === 0 ? t.border.brandDefault : t.border.default,
            backgroundColor: i === 0 ? t.background.brandSubtle : t.background.primary,
          }}
        >
          <Text variant="labelXSmall" color={i === 0 ? 'brand' : 'secondary'}>
            {c}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const meta = {
  title: 'Components/PageShell',
  component: PageShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Layered "depth" page scaffold for the funnels. A soft "aurora" band sits **behind** a **rounded-top content card** that overlaps up into it (band `z −2`, card `z 0`). Scroll is built in: the band fades + parallaxes, the header scroll-collapses past a threshold, and an optional sticky chips row pins under the header. The band is the `RadialGlow` primitive — a token-built reproduction of `header-gradient.svg` (paper base + brand-blue + coral glows); the collapse uses the `motion` tokens.',
      },
    },
  },
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Home-cleaning funnel — compact Header (step + favourite) over the soft aurora band.
export const HomeCleaningFunnel: Story = {
  render: () => {
    return (
      <View style={{ height: 720 }}>
        <PageShell
          band={<HeaderAurora />}
          bandHeight={180}
          renderHeader={(collapsed) => (
            <Header
              title="Home Cleaning"
              step={{ current: 1, total: 4 }}
              actions={[{ icon: 'heart', accessibilityLabel: 'Save to favourites', tone: 'danger', filled: true }]}
              collapsed={collapsed}
              overMedia
              onBack={() => {}}
            />
          )}
        >
          <DemoContent />
        </PageShell>
      </View>
    );
  },
};

// Salon flex funnel — taller band, a tagline over it, and a sticky category-chips row.
export const SalonFlex: Story = {
  render: () => {
    return (
      <View style={{ height: 720 }}>
        <PageShell
          band={<HeaderAurora />}
          bandHeight={240}
          bandContent={
            <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
              <Text variant="labelBase" color="primary">
                Indulge in luxury beauty services at home
              </Text>
            </View>
          }
          stickyRow={<ChipRow />}
          renderHeader={(collapsed) => (
            <Header
              title="Women's Salon"
              actions={[
                { icon: 'search', accessibilityLabel: 'Search services' },
                { icon: 'heart', accessibilityLabel: 'Save to favourites' },
              ]}
              collapsed={collapsed}
              overMedia
              onBack={() => {}}
            />
          )}
        >
          <DemoContent />
        </PageShell>
      </View>
    );
  },
};
