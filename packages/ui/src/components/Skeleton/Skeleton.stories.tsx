import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Skeleton, SkeletonText, SkeletonGroup } from './Skeleton';
import { HStack, VStack } from '../../primitives/Stack';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Shimmering loading placeholder. A left → right **wave** (perceived faster than a pulse) that respects reduce-motion. Mirror the real content’s size + radius so the swap is seamless, and wrap a set in `SkeletonGroup` so they sweep in unison and announce "Loading". (Motion only plays on device / a live browser — the headless preview shows the resting blocks.)',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The base block: lines, a circle, a wide block — plus a paragraph via `SkeletonText`. */
export const Basics: Story = {
  render: () => (
    <SkeletonGroup>
      <VStack gap="lg">
        <HStack gap="sm" align="center">
          <Skeleton circle height={40} width={40} />
          <VStack gap="sm" style={{ flex: 1 }}>
            <Skeleton height={11} width="55%" />
            <Skeleton height={9} width="35%" />
          </VStack>
        </HStack>
        <Skeleton height={140} radius={12} />
        <SkeletonText lines={3} />
      </VStack>
    </SkeletonGroup>
  ),
};

/** A faithful GHOST of `PlanBookingCard` — same surface (radius `default`, `size.12` padding, hairline
 *  border) and the real elements' radii: status `Badge` → `radius.sm`, xs CTA `Button` → `radius.md`, 40px
 *  pro avatar → `radius.default`. Nothing is pill (the real card isn't), so the swap doesn't shift. */
export const BookingCard: Story = {
  render: () => {
    const t = useTheme();
    return (
      <SkeletonGroup>
        <View
          style={{
            backgroundColor: t.background.surface,
            borderRadius: t.radius.default,
            borderWidth: t.borderWidth.hairline,
            borderColor: t.border.default,
            padding: t.size['12'],
          }}
        >
          <VStack gap="sm">
            <HStack align="center" gap="sm">
              <Skeleton height={12} width="46%" radius={t.radius.sm} />
              <View style={{ flex: 1 }} />
              <Skeleton height={18} width={76} radius={t.radius.sm} />
            </HStack>
            <VStack gap="xs">
              <HStack align="center" gap="sm">
                <Skeleton height={9} width="26%" radius={t.radius.sm} />
                <View style={{ flex: 1 }} />
                <Skeleton height={9} width="34%" radius={t.radius.sm} />
              </HStack>
              <HStack align="center" gap="sm">
                <Skeleton height={9} width="20%" radius={t.radius.sm} />
                <View style={{ flex: 1 }} />
                <Skeleton height={9} width="40%" radius={t.radius.sm} />
              </HStack>
            </VStack>
            <View style={{ height: t.borderWidth.thin, backgroundColor: t.border.default }} />
            <HStack align="center" gap="sm">
              <Skeleton width={40} height={40} radius={t.radius.default} />
              <VStack gap="xs" style={{ flex: 1 }}>
                <Skeleton height={9} width={88} radius={t.radius.sm} />
                <Skeleton height={16} width={44} radius={t.radius.sm} />
              </VStack>
              <Skeleton height={28} width={104} radius={t.radius.md} />
            </HStack>
          </VStack>
        </View>
      </SkeletonGroup>
    );
  },
};

/** Content-aware — a list of rows (avatar + two text lines), all sweeping together. */
export const ListRows: Story = {
  render: () => (
    <SkeletonGroup>
      <VStack gap="lg">
        {[0, 1, 2, 3].map((i) => (
          <HStack key={i} gap="sm" align="center">
            <Skeleton circle height={40} width={40} />
            <VStack gap="sm" style={{ flex: 1 }}>
              <Skeleton height={10} width="60%" />
              <Skeleton height={9} width="40%" />
            </VStack>
            <Skeleton height={20} width={20} radius={6} />
          </HStack>
        ))}
      </VStack>
    </SkeletonGroup>
  ),
};

/** Reduce-motion / static — `animated={false}` renders the resting blocks (also the reduce-motion fallback). */
export const Static: Story = {
  render: () => (
    <VStack gap="sm">
      <Skeleton height={14} width="70%" animated={false} />
      <Skeleton height={14} width="90%" animated={false} />
      <Skeleton height={14} width="50%" animated={false} />
    </VStack>
  ),
};
