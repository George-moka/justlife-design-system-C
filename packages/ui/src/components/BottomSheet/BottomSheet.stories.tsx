import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { PaymentMethodCard, PaymentLogo } from '../PaymentMethodCard';

/** A bounded, positioned "screen" so the absolute overlay has a frame to fill (and dim). */
function Stage({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ position: 'relative', height: 620, overflow: 'hidden', backgroundColor: t.background.secondary }}>
      <View style={{ padding: t.space.md, gap: t.space.sm }}>
        <Text variant="titleSmall">Screen behind the sheet</Text>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ height: t.size['48'], borderRadius: t.radius.default, backgroundColor: t.background.primary }} />
        ))}
      </View>
      {children}
    </View>
  );
}

const PAYMENT_METHODS = [
  { key: 'mc', logo: 'mastercard' as const, title: 'Credit / Debit Card', number: '•••• •••• •••• 6409' },
  { key: 'visa', logo: 'visa' as const, title: 'Credit / Debit Card', number: '•••• •••• •••• 1234' },
  { key: 'applePay', logo: 'applePay' as const, title: 'Apple Pay', number: undefined as string | undefined },
];

function PaymentMethods() {
  const t = useTheme();
  const [selected, setSelected] = useState('mc');
  return (
    <>
      {PAYMENT_METHODS.map((m) => (
        <PaymentMethodCard
          key={m.key}
          icon={<PaymentLogo name={m.logo} label={m.title} />}
          title={m.title}
          number={m.number}
          selected={selected === m.key}
          recessed
          onPress={() => setSelected(m.key)}
        />
      ))}
      <PaymentMethodCard
        icon={<Icon name="plus" size="md" color={t.icon.brand} />}
        title="Add new card"
        trailing="Add"
        trailingTone="action"
        recessed
        onPress={() => {}}
      />
    </>
  );
}

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Modal **bottom sheet**: a dimming scrim (tap to dismiss) over a surface that rises from the bottom with rounded **top** corners (`radius.2xl` = 24). Anatomy: centred grabber · circular close in the top-right corner · left-aligned title · scrollable body · optional pinned footer. Height caps at 90% of the host; the footer clears the home indicator via `safeArea.bottom`. Renders as an absolute overlay filling its positioned parent (drop it inside the screen), so it stays inside a device frame instead of portalling out.',
      },
    },
  },
  decorators: [(Story) => <Stage><Story /></Stage>],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The change-payment sheet: a radio list of saved methods + an "Add new card" action + Apply. */
export const Default: Story = {
  render: () => (
    <BottomSheet title="Payment Method" onClose={() => {}} footer={<Button variant="secondary" fullWidth>Apply</Button>}>
      <PaymentMethods />
    </BottomSheet>
  ),
};

/** No footer — content only (e.g. an informational sheet). */
export const WithoutFooter: Story = {
  render: () => {
    const t = useTheme();
    return (
      <BottomSheet title="About this service" onClose={() => {}}>
        <Text variant="bodyMedium" color="secondary" style={{ marginBottom: t.space.sm }}>
          The session amount is reserved on your card and only charged once the session is completed.
        </Text>
      </BottomSheet>
    );
  },
};

/** No grabber handle (when drag-to-dismiss isn't offered). */
export const NoGrabber: Story = {
  render: () => (
    <BottomSheet title="Payment Method" showGrabber={false} onClose={() => {}} footer={<Button variant="secondary" fullWidth>Apply</Button>}>
      <PaymentMethods />
    </BottomSheet>
  ),
};

/**
 * A **card-list** sheet: `divider` rules the header off, and `titleInset="content"` moves the title to
 * `space.xl` so it lines up with the text *inside* the cards (16 gutter + 16 card padding) rather than
 * with their edges. Leave the default `edge` for bodies of plain text, fields or flat rows.
 */
export const TitleInsetContent: Story = {
  render: () => (
    <BottomSheet
      title="Payment Method"
      titleInset="content"
      divider
      onClose={() => {}}
      footer={<Button variant="secondary" fullWidth>Apply</Button>}
    >
      <PaymentMethods />
    </BottomSheet>
  ),
};

/** Tall content — the body scrolls while the header, footer and corners stay put (height caps at 90%). */
export const Scrollable: Story = {
  render: () => {
    return (
      <BottomSheet title="Terms" onClose={() => {}} footer={<Button variant="secondary" fullWidth>Accept</Button>}>
        {Array.from({ length: 14 }).map((_, i) => (
          <Text key={i} variant="bodyMedium" color="secondary">
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
          </Text>
        ))}
      </BottomSheet>
    );
  },
};

/** Interactive — open and dismiss (scrim tap or close button). */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <View style={{ position: 'absolute', top: 24, left: 0, right: 0, alignItems: 'center', zIndex: 1 }}>
          <Button onPress={() => setOpen(true)}>Open sheet</Button>
        </View>
        <BottomSheet title="Payment Method" open={open} onClose={() => setOpen(false)} footer={<Button variant="secondary" fullWidth onPress={() => setOpen(false)}>Apply</Button>}>
          <PaymentMethods />
        </BottomSheet>
      </>
    );
  },
};
