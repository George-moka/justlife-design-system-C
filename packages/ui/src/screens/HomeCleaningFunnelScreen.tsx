import { useEffect, useState } from 'react';
import {
  ADDRESSES,
  AddressSection,
  AddressSheet,
  AutoAssignChoice,
  ProChoiceCard,
  type FunnelPro,
} from './funnel-address';
export { ProChoice, ProAvatar } from './funnel-address';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  Header,
  PageShell,
  ScreenAurora,
  Card,
  CheckoutBar,
  BottomSheet,
  StepIndicator,
  SpecialInstructions,
  AddOnsCard,
  InfoCard,
  PaymentMethodCard,
  PaymentLogo,
  PriceDetails,
  type PriceDetailsRow,
  Button,
  DatePicker,
  TimeSlotPicker,
  WeekdayPicker,
  NumberSelector,
  PillGroup,
  Question,
  PlanSelectCard,
  PromiseList,
  Disclaimer,
  MiniActionCard,
  Text,
  HStack,
  VStack,
  Icon,
  Collapsible,
  Confetti,
  typographyToStyle,
  useTheme,
} from '../index';
import { EdgeSwipeBack } from '../primitives/EdgeSwipeBack';

/**
 * The **Home Cleaning booking funnel** (4 steps) — the SHARED screen rendered by BOTH Storybook (in the
 * web `Phone` frame) and the Expo app (in a native `SafeAreaView`). Built on the layered `PageShell` +
 * compact `Header`. The host supplies the safe-area insets (`safeAreaTop`/`safeAreaBottom`) and the
 * `onExit`/`onComplete` navigation, so this composition is frame-agnostic — one source of truth, no
 * web/native drift. Brand artwork the DS doesn't own yet (the "Powered by" / tabby logos) is shown as a
 * GREEN placeholder. Photo paths resolve per host (Storybook `public/`, Expo a remote URL).
 */
// Distinct demo professional avatars (deterministic per id). The DS owns only ONE cleaning-specific brand
// photo (used on the Thank-You screen as the assigned pro); for the four funnel CHOICES we use distinct
// neutral people so they read as different professionals without a wrong-profession look. Swap for real
// cleaning-pro photos when those assets exist.
export const PRO_PHOTOS = {
  rewata: 'https://i.pravatar.cc/160?img=45',
  jennefer: 'https://i.pravatar.cc/160?img=32',
  maria: 'https://i.pravatar.cc/160?img=5',
  daniel: 'https://i.pravatar.cc/160?img=1',
};

// ── shared screen helpers ───────────────────────────────────────────────────────────────────────

/**
 * The home-cleaning header band — token-built reproduction of `header-gradient-clean.svg`: a warm
 * paper base with two soft brand-blue glows (bottom-right + top-left). The "clean" service variant.
 */
/** Green placeholder for brand artwork the DS doesn't own yet. */
export function MissingLogo({ label, width = 44 }: { label: string; width?: number }) {
  return (
    <View
      style={{
        width,
        height: 20,
        borderRadius: 4,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="labelXXSmall" style={{ color: '#FFFFFF' }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Price breakdown shown when the floating `CheckoutBar` is expanded. The **Service Fee** only appears
 *  at checkout (the final step) — it isn't shown on the earlier steps. */
const BASE_SUMMARY_ROWS: PriceDetailsRow[] = [
  { label: 'Subtotal', value: 'AED 78.00' },
  { label: 'Discount', value: '−AED 9.00', tone: 'success' },
];
const SERVICE_FEE_ROW: PriceDetailsRow = { label: 'Service Fee', value: 'AED 9.00', info: true };
const summaryRows = (atCheckout: boolean): PriceDetailsRow[] =>
  atCheckout ? [...BASE_SUMMARY_ROWS, SERVICE_FEE_ROW] : BASE_SUMMARY_ROWS;

/** Booked service(s) — a list so flex funnels can show several services bought at once. */
const SERVICES = [
  { name: 'Home Cleaning', detail: '2 hours · 1 professional', price: 'AED 88.00' },
];

/**
 * Booked-service(s) summary card, shown at the top of the expanded `CheckoutBar`. Lists each service
 * (flex funnels may book several at once). Recessed (`background.secondary`) since it sits inside the
 * white summary panel. Compact type — the price is small since it's repeated in the breakdown below.
 */
function ServiceSummaryCard({
  services,
}: {
  services: { name: string; detail?: string; price?: string }[];
}) {
  const t = useTheme();
  return (
    <VStack
      gap="sm"
      style={{
        backgroundColor: t.background.secondary,
        borderRadius: t.radius.default,
        paddingHorizontal: t.space.md,
        paddingVertical: t.space.sm,
      }}
    >
      {services.map((s) => (
        <HStack key={s.name} justify="space-between" align="center" gap="sm">
          <View style={{ flex: 1 }}>
            <Text variant="labelBase" numberOfLines={1}>
              {s.name}
            </Text>
            {s.detail ? (
              <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
                {s.detail}
              </Text>
            ) : null}
          </View>
          {s.price ? (
            <Text variant="labelXSmall" numberOfLines={1}>
              {s.price}
            </Text>
          ) : null}
        </HStack>
      ))}
    </VStack>
  );
}

// ── step content ──────────────────────────────────────────────────────────────────────────────

const ADDON_BASE = 'https://deax38zvkau9d.cloudfront.net/prod/assets/images/attribute-contents/';
const addonImg = (file: string) => `${ADDON_BASE}${file}?f=webp&w=320`;
const ADDONS = [
  {
    title: 'Balcony Cleaning',
    price: 19,
    oldPrice: 25,
    img: addonImg('1729680028add-on_balcony-cleaning.webp'),
  },
  {
    title: 'Ironing and Folding',
    price: 25,
    oldPrice: 30,
    img: addonImg('1729679923add-on_ironing-folding.webp'),
  },
  {
    title: 'Fridge Cleaning',
    price: 19,
    oldPrice: 25,
    img: addonImg('1729679899add-on_fridge-cleaning.webp'),
  },
  {
    title: 'Wardrobe Cleaning',
    price: 25,
    oldPrice: 30,
    img: addonImg('1729679880add-on_wardrobe-cleaning.webp'),
  },
  {
    title: 'Cupboard Cleaning',
    price: 25,
    oldPrice: 30,
    img: addonImg('1729679954add-on_cupboard-cleaning.webp'),
  },
  {
    title: 'Party Cleaning',
    price: 25,
    oldPrice: 30,
    img: addonImg('1739459462party_category_500x500-thumbnail.webp'),
  },
];
const DAYS = [
  { day: 'FRI', date: 19 },
  { day: 'SAT', date: 20 },
  { day: 'SUN', date: 21 },
  { day: 'MON', date: 22 },
  { day: 'TUE', date: 23 },
  { day: 'WED', date: 24 },
  { day: 'THU', date: 25 },
];
const SLOTS = ['12:30 – 13:00', '13:00 – 13:30', '13:30 – 14:00', '14:00 – 14:30'];

// ── step 1: frequency ───────────────────────────────────────────────────────────────────────────

export type Frequency = 'oneTime' | 'recurring' | 'monthly';

/** The 7 weekday toggles (Mon→Sun). Single-letter labels; the duplicate T's/S's disambiguate by position. */
const WEEKDAYS: { key: string; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

/** The three plan options, in display order. Copy is verbatim from the approved design. */
const FREQUENCY_OPTIONS: {
  key: Frequency;
  title: string;
  discount?: string;
  popular?: boolean;
  bullets: string[];
}[] = [
  // 2nd bullet added so One Time matches the others' 2-bullet height (equal cards). Wording is a
  // placeholder pending approval.
  {
    key: 'oneTime',
    title: 'One Time',
    bullets: ['Perfect pick for an uncertain schedule.', 'Pay once, with no commitment.'],
  },
  {
    key: 'recurring',
    title: 'Recurring',
    discount: 'Up to 25% off',
    popular: true,
    bullets: ['Flexible, ongoing cleaning.', 'Pay after each service, no upfront cost.'],
  },
  {
    key: 'monthly',
    title: 'Monthly Subscription',
    discount: 'Up to 40% off',
    bullets: ['Prepaid short-term plan with higher savings.', 'Valid for a set duration.'],
  },
];

/** Recurring discount scales with the number of weekday(s) booked — 2 days = 13%, capped at 25%. */
const recurringDiscount = (numDays: number) => Math.min(25, 7 + 3 * numDays);

/** A "• text" plan benefit line. */
/** Expanded controls inside the selected **Recurring** card: cadence toggle, weekday picker, live banner. */
function RecurringExpansion({
  cadence,
  onCadence,
  days,
  onToggleDay,
}: {
  cadence: 'weekly' | 'biweekly';
  onCadence: (c: 'weekly' | 'biweekly') => void;
  days: string[];
  onToggleDay: (key: string) => void;
}) {
  const t = useTheme();
  const pct = recurringDiscount(days.length);
  return (
    <VStack gap="md" style={{ paddingTop: t.space.md }}>
      <PillGroup
        value={cadence}
        onChange={(k) => onCadence(k as 'weekly' | 'biweekly')}
        options={[
          { key: 'weekly', label: 'Weekly' },
          { key: 'biweekly', label: 'Every Two Weeks' },
        ]}
      />
      <VStack gap="sm">
        <Text variant="labelMedium">Which days do you prefer?</Text>
        <WeekdayPicker days={WEEKDAYS} value={days} onToggle={onToggleDay} />
      </VStack>
      {days.length > 0 ? (
        <View
          style={{
            borderRadius: t.radius.md,
            backgroundColor: t.background.promo.subtle,
            paddingHorizontal: t.space.md,
            paddingVertical: t.space.sm,
          }}
        >
          <Text variant="labelXSmall" align="center" style={{ color: t.text.promoDark }}>
            {`Yaay! You've earned ${pct}% discount. 🎉`}
            {pct < 25 ? '\nUnlock up to 25% by booking more days!' : ''}
          </Text>
        </View>
      ) : null}
    </VStack>
  );
}

/** The "justlife Promise" reassurance block under the plan cards. Its two points adapt to the plan:
 *  recurring promises the same pro + pause/cancel; otherwise more-days-more-savings + reschedule. */
const PROMISE: Record<'default' | 'recurring', { title: string; desc: string }[]> = {
  default: [
    { title: 'More Days, More Savings!', desc: 'Save up to 40% based on your plan' },
    { title: 'Reschedule or Cancel Anytime', desc: 'Total flexibility at your fingertips!' },
  ],
  recurring: [
    {
      title: 'Same Professional Guaranteed',
      desc: 'No changes, no excuses, same professional every time.',
    },
    { title: 'Pause or Cancel Anytime', desc: 'Total flexibility at your fingertips!' },
  ],
};

function JustlifePromise({ recurring }: { recurring: boolean }) {
  return (
    <PromiseList title="justlife Promise" items={PROMISE[recurring ? 'recurring' : 'default']} />
  );
}

function FrequencyStep({
  frequency,
  onFrequency,
  cadence,
  onCadence,
  days,
  onToggleDay,
}: {
  frequency: Frequency | null;
  onFrequency: (f: Frequency) => void;
  cadence: 'weekly' | 'biweekly';
  onCadence: (c: 'weekly' | 'biweekly') => void;
  days: string[];
  onToggleDay: (key: string) => void;
}) {
  const t = useTheme();
  return (
    // `flex: 1` + the spacer below push the justlife Promise to the bottom of the (grown) scroll area;
    // when Recurring expands past the viewport, the spacer collapses to its minHeight and it all scrolls.
    <VStack gap="md" style={{ flex: 1, paddingHorizontal: t.space.md, paddingBottom: t.space.lg }}>
      {FREQUENCY_OPTIONS.map((opt) => (
        <PlanSelectCard
          key={opt.key}
          selected={frequency === opt.key}
          onPress={() => onFrequency(opt.key)}
          title={opt.title}
          discount={opt.discount}
          popular={opt.popular}
          bullets={opt.bullets}
        >
          {opt.key === 'recurring' ? (
            <Collapsible open={frequency === 'recurring'}>
              <RecurringExpansion
                cadence={cadence}
                onCadence={onCadence}
                days={days}
                onToggleDay={onToggleDay}
              />
            </Collapsible>
          ) : null}
        </PlanSelectCard>
      ))}
      {/* Pushes the Promise to the bottom; keeps a minimum gap when content fills the screen. */}
      <View style={{ flexGrow: 1, minHeight: t.space.lg }} />
      <JustlifePromise recurring={frequency === 'recurring'} />
    </VStack>
  );
}

function ServiceStep({
  instructions,
  onEditInstructions,
}: {
  instructions: string;
  onEditInstructions: () => void;
}) {
  const t = useTheme();
  const [hours, setHours] = useState(2);
  const [pros, setPros] = useState(1);
  const [materials, setMaterials] = useState('no');
  return (
    <VStack gap="lg" style={{ paddingBottom: t.space.lg }}>
      <Question title="How many hours do you need your professional to stay?" info>
        <NumberSelector count={8} value={hours} onChange={setHours} />
      </Question>

      <Question title="How many professionals do you need?">
        <NumberSelector count={4} value={pros} onChange={setPros} />
      </Question>

      <VStack gap="sm" style={{ paddingHorizontal: t.space.md }}>
        <HStack gap="xs" align="center" style={{ flexWrap: 'wrap' }}>
          <Text variant="labelMedium">Need cleaning materials?</Text>
          <Icon name="info" size="sm" color={t.icon.secondary} />
          <HStack gap="xs" align="center" style={{ marginLeft: t.space.xs }}>
            <Text variant="bodyMicro" color="secondary">
              Powered by
            </Text>
            <MissingLogo label="logo" width={30} />
          </HStack>
        </HStack>
        <PillGroup
          value={materials}
          onChange={setMaterials}
          options={[
            { key: 'no', label: 'No, I have them' },
            { key: 'yes', label: 'Yes, please' },
          ]}
        />
      </VStack>

      <View style={{ paddingHorizontal: t.space.md }}>
        <SpecialInstructions
          title="Any specific instructions?"
          value={instructions || undefined}
          onPressAction={onEditInstructions}
        />
      </View>
    </VStack>
  );
}

function AddOnsStep() {
  const t = useTheme();
  return (
    <VStack gap="md" style={{ paddingBottom: t.space.lg }}>
      <Text variant="labelLarge" style={{ paddingHorizontal: t.space.md }}>
        People also added
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: t.space.md,
          paddingHorizontal: t.space.md,
        }}
      >
        {ADDONS.map((a) => (
          <View key={a.title} style={{ width: '48%' }}>
            <AddOnsCard
              title={a.title}
              price={a.price}
              oldPrice={a.oldPrice}
              currency="AED"
              image={
                <Image
                  source={{ uri: a.img }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              }
              onLearnMore={() => {}}
              onQuantityChange={() => {}}
            />
          </View>
        ))}
      </View>
      <View style={{ paddingHorizontal: t.space.md }}>
        <InfoCard tone="info" icon="info">
          The duration of the session may change based on your selection.
        </InfoCard>
      </View>
    </VStack>
  );
}

/** Home-cleaning professionals with the zones they serve (demo; subtitles = returning-customer line). */
const HOME_PROS: FunnelPro[] = [
  {
    key: 'rewata',
    name: 'Rewata',
    rating: '5.0',
    photo: PRO_PHOTOS.rewata,
    zones: ['A'],
    subtitle: 'Served you on\n24 Nov',
  },
  {
    key: 'jennefer',
    name: 'Jennefer',
    rating: '5.0',
    photo: PRO_PHOTOS.jennefer,
    zones: ['A', 'B'],
  },
  {
    key: 'maria',
    name: 'Maria',
    rating: '4.9',
    photo: PRO_PHOTOS.maria,
    zones: ['A', 'B'],
    subtitle: 'Served you on\n12 Oct',
  },
  { key: 'daniel', name: 'Daniel', rating: '4.8', photo: PRO_PHOTOS.daniel, zones: ['A'] },
];

function DateTimeStep({
  pro,
  onPro,
  zone,
  onPolicyDetails,
}: {
  /** Selected professional key — lifted to the flow so the checkout address change can revalidate it. */
  pro: string;
  onPro: (key: string) => void;
  /** The current address's zone — named pros are filtered to it. */
  zone: 'A' | 'B';
  onPolicyDetails: () => void;
}) {
  const t = useTheme();
  const [date, setDate] = useState(19);
  const [slot, setSlot] = useState(SLOTS[0]);
  return (
    <VStack gap="lg" style={{ paddingBottom: t.space.lg }}>
      {/* Frequency */}
      <View style={{ paddingHorizontal: t.space.md }}>
        <View
          style={{
            backgroundColor: t.background.selected,
            borderWidth: t.borderWidth.hairline,
            borderColor: t.border.brandDefault,
            borderRadius: t.radius.default,
            padding: t.space.md,
            gap: t.space.sm,
          }}
        >
          {/* Caption labels the field; the value below is the prominent line (the actual info). */}
          <HStack justify="space-between" align="center">
            <Text variant="labelXSmall" color="secondary">
              Frequency
            </Text>
            <Pressable accessibilityRole="button" onPress={() => {}}>
              <Text variant="labelXSmall" color="link">
                Change
              </Text>
            </Pressable>
          </HStack>
          {/* Current frequency — informative only. The "Change" link is the action, so this is a plain
              value line (icon + text), not a tappable/selected pill. */}
          <HStack gap="xs" align="center">
            <Icon name="refresh-cw" size="sm" color={t.icon.brand} />
            <Text variant="labelBase">One Time Service</Text>
          </HStack>
        </View>
      </View>

      <Question title="Which professional do you prefer?">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: t.size['8'],
            paddingHorizontal: t.space.md,
            alignItems: 'stretch',
          }}
        >
          <AutoAssignChoice selected={pro === 'auto'} onPress={() => onPro('auto')} />
          {HOME_PROS.filter((p) => p.zones.includes(zone)).map((p) => (
            <ProChoiceCard
              key={p.key}
              pro={p}
              selected={pro === p.key}
              onPress={() => onPro(p.key)}
            />
          ))}
        </ScrollView>
      </Question>

      <Question title="When would you like your service?">
        <DatePicker days={DAYS} value={date} onChange={(d) => setDate(Number(d))} />
      </Question>

      <Question title="What time would you like us to start?">
        <TimeSlotPicker slots={SLOTS} value={slot} onChange={setSlot} />
      </Question>

      <View style={{ paddingHorizontal: t.space.md }}>
        <Disclaimer action={{ label: 'Details', onPress: onPolicyDetails }}>
          Enjoy free cancellation up to 6 hours before your booking start time.
        </Disclaimer>
      </View>
    </VStack>
  );
}

// ── change-payment bottom sheet (uses the promoted `BottomSheet` from @justlife/ui) ─────────────
const PAYMENT_METHODS = [
  {
    key: 'mc',
    logo: 'mastercard' as const,
    title: 'Credit / Debit Card',
    number: '•••• •••• •••• 6409',
  },
  {
    key: 'visa',
    logo: 'visa' as const,
    title: 'Credit / Debit Card',
    number: '•••• •••• •••• 1234',
  },
  {
    key: 'applePay',
    logo: 'applePay' as const,
    title: 'Apple Pay',
    number: undefined as string | undefined,
  },
];

/** Change-payment bottom sheet — a real choice among saved methods, so the radio belongs here. */
export function ChangePaymentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const [selected, setSelected] = useState('mc');
  return (
    <BottomSheet
      open={open}
      title="Payment Method"
      onClose={onClose}
      footer={
        <Button variant="secondary" fullWidth onPress={onClose}>
          Apply
        </Button>
      }
    >
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
      {/* "Add new card" — an action row, not a selectable method (no radio). */}
      <PaymentMethodCard
        icon={<Icon name="plus" size="md" color={t.icon.brand} />}
        title="Add new card"
        trailing="Add"
        trailingTone="action"
        recessed
        onPress={() => {}}
      />
    </BottomSheet>
  );
}

const INSTRUCTIONS_MAX = 150;

/** Additional-instructions bottom sheet — a 3-line text field with an in-field character counter. */
function InstructionsSheet({
  open,
  initialValue,
  onSave,
  onClose,
}: {
  open: boolean;
  initialValue: string;
  onSave: (v: string) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  // Re-sync the field to the saved value each time the sheet opens (it stays mounted for the exit anim).
  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);
  return (
    <BottomSheet
      open={open}
      title="Additional Instructions?"
      onClose={onClose}
      footer={
        <Button variant="secondary" fullWidth onPress={() => onSave(value)}>
          Save
        </Button>
      }
    >
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={(v) => setValue(v.slice(0, INSTRUCTIONS_MAX))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          numberOfLines={3}
          maxLength={INSTRUCTIONS_MAX}
          textAlignVertical="top"
          placeholder="e.g. Please focus on the kitchen and bring eco-friendly products."
          placeholderTextColor={t.input.placeholder.color}
          accessibilityLabel="Additional instructions"
          style={[
            typographyToStyle(t.typography.bodyMedium),
            {
              minHeight: t.size['96'],
              paddingHorizontal: t.space.md,
              paddingTop: t.space.sm,
              // Reserve room for the in-field counter so text never runs under it.
              paddingBottom: t.size['24'],
              borderRadius: t.radius.control,
              borderWidth: t.borderWidth.default,
              borderColor: focused ? t.input.border.active : t.input.border.default,
              backgroundColor: t.input.bg.default,
              color: t.text.primary,
            },
          ]}
        />
        {/* Character counter — bottom-right corner, inside the field. */}
        <Text
          variant="labelXXSmall"
          color="secondary"
          style={{ position: 'absolute', right: t.space.md, bottom: t.space.sm }}
        >
          {value.length}/{INSTRUCTIONS_MAX}
        </Text>
      </View>
    </BottomSheet>
  );
}

/** Add-voucher bottom sheet — a single-line code field + "Apply" CTA (disabled until something is typed). */
export function VoucherSheet({
  open,
  initialValue,
  onApply,
  onClose,
}: {
  open: boolean;
  initialValue: string;
  onApply: (code: string) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const [code, setCode] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const trimmed = code.trim();
  // Re-sync the field each time the sheet opens (it stays mounted for the exit animation).
  useEffect(() => {
    if (open) setCode(initialValue);
  }, [open, initialValue]);
  return (
    <BottomSheet
      open={open}
      title="Add Voucher Code"
      onClose={onClose}
      footer={
        <Button variant="secondary" fullWidth disabled={!trimmed} onPress={() => onApply(trimmed)}>
          Apply
        </Button>
      }
    >
      <TextInput
        value={code}
        onChangeText={setCode}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="Enter voucher code"
        placeholderTextColor={t.input.placeholder.color}
        accessibilityLabel="Voucher code"
        returnKeyType="done"
        onSubmitEditing={() => trimmed && onApply(trimmed)}
        style={[
          typographyToStyle(t.typography.bodyMedium),
          {
            height: t.size['48'],
            paddingHorizontal: t.space.md,
            borderRadius: t.radius.control,
            borderWidth: t.borderWidth.default,
            borderColor: focused ? t.input.border.active : t.input.border.default,
            backgroundColor: t.input.bg.default,
            color: t.text.primary,
          },
        ]}
      />
    </BottomSheet>
  );
}

// ── cancellation-policy bottom sheet ────────────────────────────────────────────────────────────
// Exact policy copy as supplied — do not reword.
const POLICY_ROWS: { type: string; cancellation: string; reschedule: string }[] = [
  {
    type: '15 minutes after placing the request',
    cancellation: 'Free of charge',
    reschedule: 'Free of charge',
  },
  {
    type: '6+ hours before the booking',
    cancellation: 'Free of charge',
    reschedule: 'Free of charge',
  },
  {
    type: '2-6 hours before the booking',
    cancellation: '50% of the booking value',
    reschedule: '25% of the booking value',
  },
  {
    type: 'Less than 2 hours before the booking',
    cancellation: '100% of the booking value',
    reschedule: '50% of the booking value',
  },
  {
    type: 'After start time',
    cancellation: '100% of the booking value',
    reschedule: '50% of the booking value',
  },
];

/**
 * Cancellation & rescheduling policy — the booking's fee schedule. **Neutral by design** (a reference,
 * not a nudge to cancel): no colour-coding, the exact policy copy verbatim. A clean 3-column table with
 * ruled dividers and **every row the same height** (fixed row height, content vertically centred) per
 * the equal-rows rule; the cash-paid reschedule caveat is the footnote.
 */
export function CancellationPolicySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  // Wide enough for the "Cancellation Fee" header on one line (~102px + its right padding); narrows the
  // Type column but keeps it ≥2 short lines, so rows stay equal. (No size token between 96 and 120.)
  const FEE_COL = 112;
  const ROW_H = t.size['64'];
  return (
    <BottomSheet open={open} title="Cancellation and rescheduling policy" onClose={onClose}>
      <View>
        {/* Column headers */}
        <View style={{ flexDirection: 'row', paddingBottom: t.space.sm }}>
          <Text
            variant="labelXSmall"
            color="secondary"
            style={{ flex: 1, paddingRight: t.space.sm }}
          >
            Type
          </Text>
          <Text
            variant="labelXSmall"
            color="secondary"
            style={{ width: FEE_COL, paddingRight: t.space.sm }}
          >
            Cancellation Fee
          </Text>
          <Text variant="labelXSmall" color="secondary" style={{ width: FEE_COL }}>
            Reschedule Fee*
          </Text>
        </View>

        {/* One row per time window — all the same height, content vertically centred. */}
        {POLICY_ROWS.map((r) => (
          <View key={r.type}>
            <View style={{ height: t.borderWidth.hairline, backgroundColor: t.border.default }} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: ROW_H,
                paddingVertical: t.space.sm,
              }}
            >
              <Text
                variant="bodyXSmall"
                color="primary"
                style={{ flex: 1, paddingRight: t.space.sm }}
              >
                {r.type}
              </Text>
              <Text
                variant="bodyXSmall"
                color="primary"
                style={{ width: FEE_COL, paddingRight: t.space.sm }}
              >
                {r.cancellation}
              </Text>
              <Text variant="bodyXSmall" color="primary" style={{ width: FEE_COL }}>
                {r.reschedule}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Caveat in a neutral disclaimer container (matches the page disclaimer); text keeps the source red. */}
      <HStack
        gap="sm"
        align="center"
        style={{
          paddingHorizontal: t.space.md,
          paddingVertical: t.space.sm,
          borderRadius: t.radius.default,
          backgroundColor: t.background.tertiary,
        }}
      >
        <Icon name="info" size="md" color={t.icon.secondary} />
        <Text variant="labelXSmall" color="error" style={{ flex: 1 }}>
          *You can reschedule a cash-paid booking up to two times.
        </Text>
      </HStack>
    </BottomSheet>
  );
}

function CheckoutStep({
  address,
  onChangeAddress,
  onChangePayment,
  voucher,
  onAddVoucher,
  onRemoveVoucher,
}: {
  address: (typeof ADDRESSES)[number];
  onChangeAddress: () => void;
  onChangePayment: () => void;
  voucher: string;
  onAddVoucher: () => void;
  onRemoveVoucher: () => void;
}) {
  const t = useTheme();
  return (
    <VStack gap="lg" style={{ paddingHorizontal: t.space.md, paddingBottom: t.space.md }}>
      {/* Service address — the shared checkout block (AGENTS #46/#47). */}
      <AddressSection address={address} onChange={onChangeAddress} />

      {/* tabby — slim row */}
      <Card
        bordered
        padded={false}
        elevation="none"
        style={{ paddingVertical: t.size['12'], paddingHorizontal: t.size['12'] }}
      >
        <HStack gap="sm" align="center">
          <MissingLogo label="tabby" />
          <Text variant="bodyXSmall" color="secondary" style={{ flex: 1 }}>
            4 interest-free instalments-no extra fees
          </Text>
          <Icon name="info" size="sm" color={t.icon.secondary} />
        </HStack>
      </Card>

      <VStack gap="sm">
        <HStack gap="xs" align="center">
          <Text variant="labelMedium">Payment Method</Text>
          <Icon name="info" size="sm" color={t.icon.secondary} />
        </HStack>
        {/* The chosen method with its "Change" action inside the card (tap the row to switch) —
            no radio, since there's a single current method, not a choice among visible options. */}
        <PaymentMethodCard
          icon={<PaymentLogo name="mastercard" label="Mastercard" />}
          title="Credit / Debit Card"
          number="•••• •••• •••• 6409"
          trailing="Change"
          trailingTone="action"
          onPress={onChangePayment}
        />
        <InfoCard tone="info" icon="info">
          The session amount will be reserved on your card. You will be charged once the session is
          completed.
        </InfoCard>
      </VStack>

      <VStack gap="sm">
        <Text variant="labelMedium">Apply Voucher or Wallet Balance</Text>
        <HStack gap="sm" align="stretch">
          <View style={{ flex: 1 }}>
            <MiniActionCard
              label="Voucher Code"
              action="Add"
              onPress={onAddVoucher}
              value={voucher || undefined}
              onRemove={onRemoveVoucher}
              removeLabel="Remove voucher"
            />
            {/* Celebratory burst when a code is applied — re-fires for a different code (runKey). */}
            {voucher ? <Confetti origin="center" count={16} runKey={voucher} /> : null}
          </View>
          <MiniActionCard label="No Available Credit" action="Details" onPress={() => {}} />
        </HStack>
      </VStack>

      <PriceDetails
        title="Payment Summary"
        rows={[
          { label: 'Subtotal', value: 'AED 88.00' },
          { label: 'Amazon Card Discount', value: '−AED 8.80', tone: 'success' },
          { label: 'Service Fee', value: 'AED 9.00', info: true },
        ]}
        total={{ label: 'Total (inc. VAT)', value: 'AED 88.20' }}
      />
    </VStack>
  );
}

// ── the navigable flow ──────────────────────────────────────────────────────────────────────────

interface StepCtx {
  /** Opens the change-payment bottom sheet (checkout step). */
  onChangePayment: () => void;
  /** Current special instructions (step 1). */
  instructions: string;
  /** Opens the additional-instructions bottom sheet (step 1). */
  onEditInstructions: () => void;
  /** Applied voucher code, or '' (checkout step). */
  voucher: string;
  /** Opens the add-voucher bottom sheet (checkout step). */
  onAddVoucher: () => void;
  /** Clears the applied voucher (the ✕ on the applied card). */
  onRemoveVoucher: () => void;
  /** Opens the cancellation-policy bottom sheet (Date & Time step). */
  onPolicyDetails: () => void;
  /** Selected plan, or `null` until the user picks one (Frequency step). */
  frequency: Frequency | null;
  /** Picks a plan (Frequency step). */
  onFrequency: (f: Frequency) => void;
  /** Recurring cadence; defaults to weekly (Frequency step). */
  cadence: 'weekly' | 'biweekly';
  /** Sets the recurring cadence (Frequency step). */
  onCadence: (c: 'weekly' | 'biweekly') => void;
  /** Selected recurring weekday keys (Frequency step). */
  days: string[];
  /** Toggles a recurring weekday (Frequency step). */
  onToggleDay: (key: string) => void;
  /** Selected professional (Date & Time step; revalidated by the checkout address change). */
  pro: string;
  onPro: (key: string) => void;
  /** Current address's availability zone (Date & Time step pro filter). */
  zone: 'A' | 'B';
  /** Current service address (checkout step). */
  address: (typeof ADDRESSES)[number];
  /** Opens the change-address sheet (checkout step). */
  onChangeAddress: () => void;
}

interface StepConfig {
  title: string;
  cta: string;
  /** Pre-formatted totals for the `CheckoutBar`; omitted on the Frequency step (no price yet). */
  oldTotal?: string;
  total?: string;
  heart?: boolean;
  /** `'cta'` = a plain full-width button (Frequency step, no price); `'checkout'` = the expandable
   *  `CheckoutBar`. Defaults to `'checkout'`. */
  footerKind?: 'cta' | 'checkout';
  /**
   * What leads the page — drives the content top inset: a **card** gets a top gap equal to the page's
   * left/right padding (`space.md`); **text** gets more breathing room (`space.lg`) under the card top.
   */
  firstItem: 'card' | 'text';
  content: (ctx: StepCtx) => React.ReactNode;
}

const STEPS: Record<number, StepConfig> = {
  1: {
    title: 'Frequency',
    cta: 'Next',
    footerKind: 'cta',
    firstItem: 'card',
    content: (ctx) => (
      <FrequencyStep
        frequency={ctx.frequency}
        onFrequency={ctx.onFrequency}
        cadence={ctx.cadence}
        onCadence={ctx.onCadence}
        days={ctx.days}
        onToggleDay={ctx.onToggleDay}
      />
    ),
  },
  2: {
    title: 'Home Cleaning',
    cta: 'Next',
    oldTotal: 'AED 88.00',
    total: 'AED 79.20',
    heart: true,
    firstItem: 'text',
    content: (ctx) => (
      <ServiceStep instructions={ctx.instructions} onEditInstructions={ctx.onEditInstructions} />
    ),
  },
  3: {
    title: 'Popular Add-ons',
    cta: 'Next',
    oldTotal: 'AED 88.00',
    total: 'AED 79.20',
    firstItem: 'text',
    content: () => <AddOnsStep />,
  },
  4: {
    title: 'Date & Time',
    cta: 'Next',
    oldTotal: 'AED 88.00',
    total: 'AED 79.20',
    firstItem: 'card',
    content: (ctx) => (
      <DateTimeStep
        pro={ctx.pro}
        onPro={ctx.onPro}
        zone={ctx.zone}
        onPolicyDetails={ctx.onPolicyDetails}
      />
    ),
  },
  5: {
    title: 'Checkout',
    cta: 'Complete',
    oldTotal: 'AED 97.00',
    total: 'AED 88.20',
    firstItem: 'card',
    content: (ctx) => (
      <CheckoutStep
        address={ctx.address}
        onChangeAddress={ctx.onChangeAddress}
        onChangePayment={ctx.onChangePayment}
        voucher={ctx.voucher}
        onAddVoucher={ctx.onAddVoucher}
        onRemoveVoucher={ctx.onRemoveVoucher}
      />
    ),
  },
};
const TOTAL_STEPS = 5;

/**
 * The shared Home Cleaning funnel flow. **Frame-agnostic** — the host wraps it (web `Phone` / native
 * `SafeAreaView`) and supplies the safe-area insets + navigation: `onExit` = back from step 1, `onComplete`
 * = the final "Complete" CTA (the host routes to Thank-You). `key={step}` remounts the shell per page so
 * each starts expanded.
 */
export function HomeCleaningFunnelScreen({
  safeAreaTop,
  safeAreaBottom,
  onExit,
  onComplete,
  initialStep = 1,
}: {
  /** Status-bar / notch inset above the header (web: a fixed ~69; native: `insets.top`). */
  safeAreaTop: number;
  /** Home-indicator inset below the floating bar (web: `safeArea.bottom`; native: `insets.bottom`). */
  safeAreaBottom: number;
  /** Back from step 1 (host pops the screen). */
  onExit: () => void;
  /** The final "Complete" CTA (host navigates to Thank-You). */
  onComplete: () => void;
  initialStep?: number;
}) {
  const t = useTheme();
  const [step, setStep] = useState(initialStep);
  const [paymentSheet, setPaymentSheet] = useState(false);
  const [instructionsSheet, setInstructionsSheet] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [voucherSheet, setVoucherSheet] = useState(false);
  const [voucher, setVoucher] = useState('');
  const [policySheet, setPolicySheet] = useState(false);
  const [liked, setLiked] = useState(false);
  // Address + professional live at flow level: the checkout address change can revalidate the pro.
  const [address, setAddress] = useState('home');
  const [addressSheet, setAddressSheet] = useState(false);
  const [pro, setPro] = useState('auto');
  const currentAddress = ADDRESSES.find((a) => a.key === address) ?? ADDRESSES[0];
  // Frequency step (1) — lifted here so the footer CTA can gate on a valid selection.
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [cadence, setCadence] = useState<'weekly' | 'biweekly'>('weekly');
  const [days, setDays] = useState<string[]>([]);
  const toggleDay = (key: string) =>
    setDays((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));
  // One-time / monthly are complete on tap; recurring also needs at least one weekday chosen.
  const freqValid =
    frequency === 'oneTime' ||
    frequency === 'monthly' ||
    (frequency === 'recurring' && days.length > 0);
  const cfg = STEPS[step];
  const back = () => (step > 1 ? setStep((s) => s - 1) : onExit());
  const next = () => (step >= TOTAL_STEPS ? onComplete() : setStep((s) => s + 1));

  // Band height = status-bar inset + size.80 — a little breathing room above the content card for the
  // larger title (size.72 felt squeezed; size.96 was too much). Footer clears the floating bar + indicator.
  const bandHeight = safeAreaTop + t.size['80'];
  const footerInset = t.size['96'] + safeAreaBottom;

  return (
    // Dragging in from the left edge means what the header's back control means: a step back, and
    // out of the funnel from the first step.
    <EdgeSwipeBack onBack={back}>
      {/* The screen paints its OWN canvas: this is the surface that slides, so anything behind it
          (the home underneath, in the app) is only uncovered as the gesture moves it. */}
      <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
        <PageShell
          key={step}
          pinned
          // Frequency step: grow the scroll content so the justlife Promise can sit at the bottom.
          contentGrow={cfg.footerKind === 'cta'}
          band={<ScreenAurora />}
          bandHeight={bandHeight}
          // Card-first pages: top gap = side padding (space.md). Text-first: more room (space.lg).
          contentInsetTop={cfg.firstItem === 'card' ? t.space.md : t.space.lg}
          renderHeader={() => (
            <Header
              title={cfg.title}
              titleVariant="titleLarge"
              aside={<StepIndicator current={step} total={TOTAL_STEPS} />}
              actions={
                cfg.heart
                  ? [
                      {
                        icon: 'heart',
                        accessibilityLabel: liked ? 'Remove from favourites' : 'Save to favourites',
                        // Default = dark outline; tapped = filled red favourite.
                        tone: liked ? 'danger' : 'default',
                        filled: liked,
                        onPress: () => setLiked((v) => !v),
                      },
                    ]
                  : undefined
              }
              overMedia
              safeAreaTop={safeAreaTop}
              onBack={back}
            />
          )}
          footerInset={footerInset}
        >
          {cfg.content({
            onChangePayment: () => setPaymentSheet(true),
            instructions,
            onEditInstructions: () => setInstructionsSheet(true),
            voucher,
            onAddVoucher: () => setVoucherSheet(true),
            onRemoveVoucher: () => setVoucher(''),
            onPolicyDetails: () => setPolicySheet(true),
            frequency,
            onFrequency: setFrequency,
            cadence,
            onCadence: setCadence,
            days,
            onToggleDay: toggleDay,
            pro,
            onPro: setPro,
            zone: currentAddress.zone ?? 'A',
            address: currentAddress,
            onChangeAddress: () => setAddressSheet(true),
          })}
        </PageShell>
        {/* Footer lives OUTSIDE the per-step `key`ed PageShell so it PERSISTS across steps and can morph:
          on the Frequency step it's a full-width CTA (no price); stepping forward squeezes the CTA right
          while the price reveals. `priced` drives that morph; `ctaDisabled` gates the Frequency step. */}
        <View
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: t.zIndex.sticky }}
          pointerEvents="box-none"
        >
          <CheckoutBar
            priced={cfg.footerKind !== 'cta'}
            total={cfg.total ?? ''}
            oldTotal={cfg.oldTotal}
            cta={cfg.cta}
            onCtaPress={next}
            ctaDisabled={cfg.footerKind === 'cta' ? !freqValid : undefined}
            safeAreaBottom={safeAreaBottom}
            summary={
              cfg.footerKind === 'cta'
                ? undefined
                : {
                    header: <ServiceSummaryCard services={SERVICES} />,
                    rows: summaryRows(step === TOTAL_STEPS),
                    total: { label: 'Total (inc. VAT)', value: cfg.total ?? '' },
                  }
            }
          />
        </View>
        {/* Sheets stay mounted and animate in/out via `open` (so every close path slides down, not pops). */}
        <AddressSheet
          open={addressSheet}
          current={address}
          pro={pro}
          pros={HOME_PROS}
          serviceName="Home Cleaning"
          onApply={(addressKey, newProKey) => {
            setAddress(addressKey);
            if (newProKey) setPro(newProKey);
            setAddressSheet(false);
          }}
          onClose={() => setAddressSheet(false)}
        />
        <ChangePaymentSheet open={paymentSheet} onClose={() => setPaymentSheet(false)} />
        <InstructionsSheet
          open={instructionsSheet}
          initialValue={instructions}
          onSave={(v) => {
            setInstructions(v);
            setInstructionsSheet(false);
          }}
          onClose={() => setInstructionsSheet(false)}
        />
        <VoucherSheet
          open={voucherSheet}
          initialValue={voucher}
          onApply={(code) => {
            setVoucher(code);
            setVoucherSheet(false);
          }}
          onClose={() => setVoucherSheet(false)}
        />
        <CancellationPolicySheet open={policySheet} onClose={() => setPolicySheet(false)} />
      </View>
    </EdgeSwipeBack>
  );
}
