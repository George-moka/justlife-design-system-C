import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { HStack, VStack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Badge } from '../components/Badge';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Icon } from '../components/Icon';
import { QuantityStepper } from '../components/QuantityStepper';
import { Radio } from '../components/Radio';
import { Price } from './funnel-money';
import { SheetPriceFooter } from './funnel-sheet-footer';

/**
 * **Make Your Own Combo** — the salon funnel's first section: two discounted packs whose contents you
 * choose yourself. Each card lists what's in the pack ("What is included") and opens a sheet where the
 * services are grouped — pick as many as you like from Nails and Hair Removal, exactly one Facial.
 *
 * Content is read off the live app (names, prices, group rules, the default selections); the photos are
 * the same CDN thumbnails the rest of the funnel already streams.
 *
 * Where the app and this design system disagree, the system wins (and it is written down):
 * — the app's section title is a full-bleed grey band; ours is a plain heading (#54);
 * — the app's unchecked checkbox has a BRAND-BLUE ring, which reads as already-selected; ours is the DS
 *   `Checkbox` with its neutral ring;
 * — the app's discount plate is pink. There is no pink in this design system and we don't invent tokens,
 *   so the plate uses the promo pair the funnel's offer strip already uses.
 */

// ── content ─────────────────────────────────────────────────────────────────────────────────────

export interface ComboItem {
  key: string;
  name: string;
  /** What adding this to the pack costs, before the pack's discount. */
  price: number;
  image?: string;
}

export interface ComboGroup {
  key: string;
  title: string;
  /**
   * `many` — check as many as you like (the app shows a "Select 1 or more" tag).
   * `one`  — exactly one, so the rows are radios and the tag would be noise.
   */
  select: 'one' | 'many';
  items: ComboItem[];
}

export interface SalonCombo {
  key: string;
  name: string;
  desc: string;
  /** Percentage off the pack, e.g. 10. */
  discount: number;
  /** Minutes per item, summed for the pack's "N min" line. */
  minutesPerItem: number;
  groups: ComboGroup[];
  /** Item keys the pack ships with. */
  preset: string[];
}

const CDN = 'https://deax38zvkau9d.cloudfront.net/prod/assets/';
const img = (path: string, w = 160) => `${CDN}images/${path}?f=webp&w=${w}`;

/** Nails — every leaf service the app offers inside a combo. */
const NAILS: ComboItem[] = [
  {
    key: 'classic-manicure',
    name: 'Classic Manicure',
    price: 69,
    image: img('attribute-contents/1776229757servicethumbnails_nails_classicpedicure.png'),
  },
  {
    key: 'classic-pedicure',
    name: 'Classic Pedicure',
    price: 85,
    image: img('attribute-contents/1776229757servicethumbnails_nails_classicpedicure.png'),
  },
  {
    key: 'polish-free-manicure',
    name: 'Polish-Free Manicure (High Shine)',
    price: 69,
    image: img('attribute-groups/1772789391attributesgrouping_polishfreemanicure&pedicure.webp'),
  },
  {
    key: 'polish-free-pedicure',
    name: 'Polish-Free Pedicure (High Shine)',
    price: 79,
    image: img('attribute-groups/1772789391attributesgrouping_polishfreemanicure&pedicure.webp'),
  },
  {
    key: 'polish-change-hands',
    name: 'Polish Change (Hands)',
    price: 29,
    image: img('attribute-groups/1776256212french.jpeg'),
  },
  {
    key: 'polish-change-feet',
    name: 'Polish Change (Feet)',
    price: 29,
    image: img('attribute-groups/1776256212french.jpeg'),
  },
  {
    key: 'gel-hands',
    name: 'Gel Polish Hands (w/o removal)',
    price: 59,
    image: img('attribute-groups/1782996646parentgelpolish.png'),
  },
  {
    key: 'gel-feet',
    name: 'Gel Polish Feet (w/o removal)',
    price: 69,
    image: img('attribute-groups/1782996646parentgelpolish.png'),
  },
];

/** Hair Removal — waxing then threading, in the app's order. */
const HAIR_REMOVAL: ComboItem[] = [
  {
    key: 'brazilian-wax',
    name: 'Brazilian Wax',
    price: 89,
    image: img('attribute-contents/1759421298brazillianwax(1).webp'),
  },
  {
    key: 'full-body-brazilian',
    name: 'Full Body & Brazilian Waxing',
    price: 249,
    image: img('attribute-groups/1773231132servicethumbnails_hairremoval_fullbody&brazillianwaxing.webp'),
  },
  {
    key: 'full-body',
    name: 'Full Body Waxing (Excl. Brazilian)',
    price: 179,
    image: img('attribute-groups/1773231132servicethumbnails_hairremoval_fullbody&brazillianwaxing.webp'),
  },
  {
    key: 'underarms',
    name: 'Underarms Waxing',
    price: 29,
    image: img('attribute-contents/1759414964underarmswaxing(1).webp'),
  },
  {
    key: 'full-arms-underarms',
    name: 'Full Arms & Underarms Waxing',
    price: 69,
    image: img('attribute-contents/1759420482fullarms&underarmswaxing(1).webp'),
  },
  {
    key: 'half-legs',
    name: 'Half Legs Waxing (Up to knees only)',
    price: 59,
    image: img('attribute-groups/1773231373servicethumbnails_hairremoval_fulllegswaxing.webp'),
  },
  {
    key: 'full-legs',
    name: 'Full Legs Waxing (w/o bikini wax)',
    price: 89,
    image: img('attribute-groups/1773231373servicethumbnails_hairremoval_fulllegswaxing.webp'),
  },
  {
    key: 'upper-lip-wax',
    name: 'Upper Lip Wax',
    price: 29,
    image: img('attribute-contents/1774679889servicethumbnails_hairremoval_upperlipwaxing.webp'),
  },
  {
    key: 'stomach',
    name: 'Stomach Waxing',
    price: 59,
    image: img('attribute-contents/1774619209servicethumbnails_hairremoval_partbodywaxing(stomach).webp'),
  },
  {
    key: 'back',
    name: 'Back Waxing',
    price: 79,
    image: img('attribute-contents/1774620009servicethumbnails_hairremoval_partbodywaxing(back).webp'),
  },
  {
    key: 'eyebrow-threading',
    name: 'Eyebrow Threading',
    price: 39,
    image: img('attribute-groups/1772790659attributesgrouping_threading.webp'),
  },
  {
    key: 'full-face-threading',
    name: 'Full Face & Eyebrows Threading',
    price: 99,
    image: img('attribute-groups/1772790659attributesgrouping_threading.webp'),
  },
  {
    key: 'upper-lip-threading',
    name: 'Upper Lip Threading',
    price: 29,
    image: img('attribute-groups/1772790659attributesgrouping_threading.webp'),
  },
  {
    key: 'chin-threading',
    name: 'Chin & Jawline Threading',
    price: 39,
    image: img('attribute-contents/1774680441servicethumbnails_hairremoval_foreheadthreading.webp'),
  },
  {
    key: 'forehead-threading',
    name: 'Forehead Threading',
    price: 39,
    image: img('attribute-contents/1774680441servicethumbnails_hairremoval_foreheadthreading.webp'),
  },
  {
    key: 'neck-threading',
    name: 'Neck Threading',
    price: 49,
    image: img('attribute-contents/1774680905servicethumbnails_hairremoval_neckthreading.webp'),
  },
];

/** Facial — pick one. */
const FACIAL: ComboItem[] = [
  {
    key: 'dermalogica-facial',
    name: 'Dermalogica Facial',
    price: 229,
    image: img('attribute-groups/1772790921attributesgrouping_dermalogicafacial&cleanup.webp'),
  },
  {
    key: 'dermalogica-clean-up',
    name: 'Dermalogica Clean Up',
    price: 169,
    image: img('attribute-groups/1772790921attributesgrouping_dermalogicafacial&cleanup.webp'),
  },
  {
    key: 'herbal-facial',
    name: 'Herbal Facial',
    price: 125,
    image: img('attribute-groups/1772791184attributesgrouping_herbalcleanup.webp'),
  },
  {
    key: 'herbal-clean-up',
    name: 'Herbal Clean Up',
    price: 89,
    image: img('attribute-groups/1772791184attributesgrouping_herbalcleanup.webp'),
  },
];

/** Hair — the Saver pack's extra group. */
const HAIR: ComboItem[] = [
  {
    key: 'blowdry-short',
    name: 'Blowdry & Curls (Short-Medium)',
    price: 99,
    image: img('attribute-groups/1772792363attributesgrouping_blowdry.webp'),
  },
  {
    key: 'blowdry-long',
    name: 'Blowdry & Curls (Long)',
    price: 129,
    image: img('attribute-groups/1772792363attributesgrouping_blowdry.webp'),
  },
  {
    key: 'hair-wash',
    name: 'Hair Wash & Blow Dry',
    price: 79,
    image: img('attribute-groups/1772792363attributesgrouping_blowdry.webp'),
  },
];

const NAILS_GROUP: ComboGroup = { key: 'nails', title: 'Nails', select: 'many', items: NAILS };
const HAIR_REMOVAL_GROUP: ComboGroup = {
  key: 'hair-removal',
  title: 'Hair Removal',
  select: 'many',
  items: HAIR_REMOVAL,
};
const FACIAL_GROUP: ComboGroup = { key: 'facial', title: 'Facial', select: 'one', items: FACIAL };
const HAIR_GROUP: ComboGroup = { key: 'hair', title: 'Hair', select: 'one', items: HAIR };

export const COMBOS: SalonCombo[] = [
  {
    key: 'monthly-ritual',
    name: 'Monthly Ritual Pack',
    desc: 'Choose from threading, waxing & more to build your perfect beauty routine.',
    discount: 10,
    minutesPerItem: 33,
    groups: [NAILS_GROUP, HAIR_REMOVAL_GROUP, FACIAL_GROUP],
    preset: [
      'classic-manicure',
      'classic-pedicure',
      'full-arms-underarms',
      'eyebrow-threading',
      'dermalogica-clean-up',
    ],
  },
  {
    key: 'monthly-saver',
    name: 'Monthly Saver Pack',
    desc: 'From manicures to facials, blow dries, waxing & more, enjoy more for less.',
    discount: 25,
    minutesPerItem: 43,
    groups: [NAILS_GROUP, HAIR_REMOVAL_GROUP, FACIAL_GROUP, HAIR_GROUP],
    preset: [
      'classic-manicure',
      'classic-pedicure',
      'full-arms-underarms',
      'dermalogica-facial',
      'blowdry-short',
      'hair-wash',
    ],
  },
];

/** The four promises under the option list (app: "Your Salon Experience"). */
const EXPERIENCE: { icon: string; label: string }[] = [
  { icon: 'thumbs-up', label: 'Skilled Experts' },
  { icon: 'spray-can', label: 'Hygienic Setup' },
  { icon: 'flask-conical', label: 'Premium Products' },
  { icon: 'circle-check', label: 'Wide Service Selection' },
];

// ── selection maths ─────────────────────────────────────────────────────────────────────────────

const itemsOf = (combo: SalonCombo) => combo.groups.flatMap((g) => g.items);

/** Names of the chosen items, in the combo's own group/item order (so the card list is stable). */
export function comboItemNames(combo: SalonCombo, selection: string[]): string[] {
  const chosen = new Set(selection);
  return itemsOf(combo)
    .filter((i) => chosen.has(i.key))
    .map((i) => i.name);
}

/** What the pack costs before its discount. */
export function comboFullPrice(combo: SalonCombo, selection: string[]): number {
  const chosen = new Set(selection);
  return itemsOf(combo)
    .filter((i) => chosen.has(i.key))
    .reduce((sum, i) => sum + i.price, 0);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Discounted price, its strikethrough original, and what the two differ by. */
export function comboPricing(combo: SalonCombo, selection: string[]) {
  const full = comboFullPrice(combo, selection);
  const price = round2(full * (1 - combo.discount / 100));
  return { full, price, saving: round2(full - price) };
}

export const comboMinutes = (combo: SalonCombo, selection: string[]) =>
  selection.length * combo.minutesPerItem;

// ── the card ────────────────────────────────────────────────────────────────────────────────────

/** How many included lines the card shows before it collapses the rest into "+N". */
const INCLUDED_LINES = 5;

/**
 * The discount plate. Square, so the two-line "10% / OFF" sits in the middle of it rather than in a
 * strip that would fight the title for width.
 */
function DiscountPlate({ discount }: { discount: number }) {
  const t = useTheme();
  return (
    <VStack
      align="center"
      justify="center"
      style={{
        width: t.size['80'],
        height: t.size['80'],
        borderRadius: t.radius.default,
        backgroundColor: t.background.promo.subtle,
      }}
    >
      <Text variant="titleLarge" style={{ color: t.text.promoDark }}>
        {discount}%
      </Text>
      {/* The word rides under the number at the label scale — it labels the number, it isn't a second
          headline. `labelXSmall` keeps it readable at the plate's width without a third type size. */}
      <Text variant="labelXSmall" style={{ color: t.text.promo }}>
        OFF
      </Text>
    </VStack>
  );
}

/**
 * What's in the pack. A recessed panel inside the card (the DS elevation model — a nested fill on a
 * raised surface), capped at five lines: past that the fifth line carries a brand "+N", exactly like
 * the app, so a long pack never pushes the next card off the screen.
 */
function IncludedPanel({ names, onEdit }: { names: string[]; onEdit: () => void }) {
  const t = useTheme();
  const shown = names.slice(0, INCLUDED_LINES);
  const extra = names.length - shown.length;
  return (
    // Everything here is passive except the link: on native a plain `View` still SWALLOWS a touch
    // (unlike the web), so the card's press target underneath only hears the tap if the passive parts
    // are explicitly `none`. `box-none` alone is not enough — it excuses the box, not its children.
    <VStack
      gap="xs"
      pointerEvents="box-none"
      style={{
        backgroundColor: t.background.secondary,
        borderRadius: t.radius.default,
        padding: t.size['12'],
      }}
    >
      <HStack justify="space-between" align="center" pointerEvents="box-none">
        <View pointerEvents="none">
          <Text variant="labelXSmall">What is included</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit combo"
          onPress={onEdit}
          hitSlop={t.space.sm}
        >
          {({ pressed }) => (
            <Text variant="labelXSmall" style={{ color: t.text.brand, opacity: pressed ? 0.6 : 1 }}>
              Edit Combo
            </Text>
          )}
        </Pressable>
      </HStack>
      {shown.map((name, i) => (
        <HStack key={name + i} gap="sm" align="flex-start" pointerEvents="none">
          {/* A bullet, not an icon: the list is a recital of what you picked, not a checklist. */}
          <Text variant="bodyXSmall" color="tertiary">
            •
          </Text>
          <Text variant="bodyXSmall" color="secondary" style={{ flex: 1 }}>
            {name}
            {i === shown.length - 1 && extra > 0 ? (
              <Text variant="bodyXSmall" style={{ color: t.text.brand }}>{`  +${extra}`}</Text>
            ) : null}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

export function ComboCard({
  combo,
  selection,
  quantity,
  onOpen,
  onQuantityChange,
}: {
  combo: SalonCombo;
  /** The item keys currently in this pack — the preset until the customer edits it. */
  selection: string[];
  quantity: number;
  /** Tapping the card, or "Edit Combo", opens the pack's sheet. */
  onOpen: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  const t = useTheme();
  const { price, full } = comboPricing(combo, selection);
  const inCart = quantity > 0;
  const [pressed, setPressed] = useState(false);
  return (
    // The whole card opens the sheet, but it CANNOT be a Pressable wrapping the Add control and the
    // "Edit Combo" link — that nests a button inside a button (invalid DOM on web, and one a11y target
    // swallowing two). So the card is a plain surface with its press target lying underneath, exactly
    // like `BookAgainCard`: `box-none` lets taps fall through the content to it, while the real
    // controls on top keep their own presses.
    <View
      style={{
        borderRadius: t.radius.default,
        backgroundColor: t.background.surface,
        // In the basket the card takes a BRAND OUTLINE — nothing else. A rail down one edge was a
        // shape nothing else here uses, and the selected FILL (`background.selected`) would fight two
        // things at once: white means raised in this system, and the card's own "What is included"
        // panel is a warm grey that turns muddy on cyan. Default state has no visible edge: the border
        // is always drawn but painted the card's own surface, so marking it shifts nothing.
        borderWidth: t.borderWidth.thin,
        borderColor: inCart ? t.border.brandDefault : t.background.surface,
        overflow: 'hidden',
        opacity: pressed ? 0.7 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={combo.name}
        onPress={onOpen}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={StyleSheet.absoluteFill}
      />
      <VStack gap="sm" pointerEvents="box-none" style={{ padding: t.size['12'] }}>
        <HStack gap="md" align="flex-start" pointerEvents="none">
          <DiscountPlate discount={combo.discount} />
          <VStack gap="xs" style={{ flex: 1 }}>
            <HStack gap="xs" align="center">
              {inCart ? (
                <Text variant="titleSmall" style={{ color: t.text.brand }}>
                  {quantity}X
                </Text>
              ) : null}
              <Text variant="titleSmall" style={{ flex: 1 }} numberOfLines={1}>
                {combo.name}
              </Text>
            </HStack>
            <HStack gap="xs" align="flex-start">
              {/* The clock belongs to the sentence, so it rides the FIRST line's optical centre — the
                  icon has no style prop, so the nudge lives on the box around it. */}
              <View style={{ paddingTop: t.size['2'] }}>
                <Icon name="clock" size="xs" color={t.icon.secondary} />
              </View>
              <Text variant="bodyXSmall" color="secondary" style={{ flex: 1 }}>
                {`${comboMinutes(combo, selection)} min • ${combo.desc}`}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <HStack justify="space-between" align="center" gap="sm" pointerEvents="box-none">
          <HStack gap="xs" align="center" style={{ flexShrink: 1 }} pointerEvents="none">
            <Price amount={price} variant="labelBase" />
            <Price amount={full} variant="bodyXSmall" color="tertiary" strike />
            <Badge tone="successSubtle" icon="tag">{`${combo.discount}%`}</Badge>
          </HStack>
          {inCart ? (
            <QuantityStepper size="sm" value={quantity} min={0} onChange={onQuantityChange} />
          ) : (
            <Button size="2xs" onPress={() => onQuantityChange(1)}>
              Add
            </Button>
          )}
        </HStack>

        <IncludedPanel names={comboItemNames(combo, selection)} onEdit={onOpen} />
      </VStack>
    </View>
  );
}

// ── the sheet ───────────────────────────────────────────────────────────────────────────────────

/** One selectable service inside the sheet. */
function OptionRow({
  item,
  select,
  checked,
  onToggle,
}: {
  item: ComboItem;
  select: 'one' | 'many';
  checked: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={select === 'one' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked }}
      accessibilityLabel={item.name}
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.md,
        // Rows are equal height by construction (fixed thumb + a single-line-or-wrapped name).
        minHeight: t.size['56'],
        paddingHorizontal: t.space.md,
        paddingVertical: t.space.sm,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: t.size['40'],
          height: t.size['40'],
          borderRadius: t.radius.md,
          overflow: 'hidden',
          backgroundColor: t.background.tertiary,
        }}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            accessibilityIgnoresInvertColors
          />
        ) : null}
      </View>
      <Text variant="bodyXSmall" style={{ flex: 1 }}>
        {item.name}
      </Text>
      <Price amount={item.price} variant="labelXSmall" prefix="+ " />
      {/* The row owns the press, so the control is the decorative half of it — never a second button
          nested inside the first. */}
      {select === 'one' ? (
        <Radio selected={checked} interactive={false} />
      ) : (
        <Checkbox checked={checked} size="sm" interactive={false} />
      )}
    </Pressable>
  );
}

/** "I don't need Nails" — the row that empties a group. Same anatomy, no thumbnail, no price. */
function OptOutRow({
  title,
  select,
  checked,
  onPress,
}: {
  title: string;
  select: 'one' | 'many';
  checked: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={select === 'one' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.md,
        minHeight: t.size['48'],
        paddingHorizontal: t.space.md,
        paddingVertical: t.space.sm,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text variant="bodyXSmall" color="secondary" style={{ flex: 1 }}>
        {`I don't need ${title}`}
      </Text>
      {select === 'one' ? (
        <Radio selected={checked} interactive={false} />
      ) : (
        <Checkbox checked={checked} size="sm" interactive={false} />
      )}
    </Pressable>
  );
}

/**
 * The live saving. It sits between the list and the footer and re-reads itself every time the
 * selection changes, so the number is always the one the CTA is about — and it can be dismissed,
 * because a permanent congratulation stops being one.
 */
function SavingNote({ amount, onDismiss }: { amount: number; onDismiss: () => void }) {
  const t = useTheme();
  return (
    <HStack
      gap="sm"
      align="center"
      style={{
        // The sheet's footer slot already carries the side gutter — only the gap below is ours.
        marginBottom: t.space.sm,
        paddingVertical: t.space.sm,
        paddingLeft: t.space.md,
        paddingRight: t.space.sm,
        borderRadius: t.radius.default,
        backgroundColor: t.background.selected,
      }}
    >
      <Icon name="party-popper" size="sm" color={t.text.promo} />
      <HStack gap="none" align="center" style={{ flex: 1, flexWrap: 'wrap' }}>
        <Text variant="labelXSmall" style={{ color: t.text.promoDark }}>
          {"Score! You're saving "}
        </Text>
        <Price amount={amount} variant="labelXSmall" />
        <Text variant="labelXSmall" style={{ color: t.text.promoDark }}>
          {' with this combo.'}
        </Text>
      </HStack>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}
        hitSlop={t.space.sm}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.6 : 1 }}>
            <Icon name="x" size="sm" color={t.icon.secondary} />
          </View>
        )}
      </Pressable>
    </HStack>
  );
}

export function ComboSheet({
  combo,
  selection,
  onApply,
  onClose,
}: {
  /** The pack being edited — `null` closes the sheet. */
  combo: SalonCombo | null;
  /** The selection to open with. */
  selection: string[];
  /** "Add To Cart" — the edited pack goes in the basket. */
  onApply: (keys: string[]) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const [draft, setDraft] = useState<string[]>(selection);
  const [noteOpen, setNoteOpen] = useState(true);
  // The sheet stays mounted between opens (so every close animates), so it re-seeds itself on each
  // one: a draft you closed without adding is not a decision, and it must not come back next time.
  const openedKey = combo?.key ?? '';
  const [seeded, setSeeded] = useState(openedKey);
  if (openedKey !== seeded) {
    setSeeded(openedKey);
    if (openedKey) {
      setDraft(selection);
      setNoteOpen(true);
    }
  }

  const chosen = useMemo(() => new Set(draft), [draft]);
  const pricing = combo ? comboPricing(combo, draft) : { full: 0, price: 0, saving: 0 };

  const toggle = (group: ComboGroup, key: string) => {
    setDraft((cur) => {
      if (group.select === 'one') {
        // One per group: the others in it step aside.
        const others = cur.filter((k) => !group.items.some((i) => i.key === k));
        return cur.includes(key) ? others : [...others, key];
      }
      return cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    });
  };

  const clearGroup = (group: ComboGroup) =>
    setDraft((cur) => cur.filter((k) => !group.items.some((i) => i.key === k)));

  const groupEmpty = (group: ComboGroup) => !group.items.some((i) => chosen.has(i.key));

  return (
    <BottomSheet
      open={!!combo}
      onClose={onClose}
      title={combo?.name ?? ''}
      divider
      // The list runs edge to edge — a row is a full-width press target, and its own padding carries
      // the gutter, so the thumbnails and controls line up with the header above them (#60).
      bodyBleed
      // The option list always outruns the sheet, so the footer needs its own rule — without it the
      // last visible row and the price read as one block.
      footerDivider
      // A long list you scroll: at the 90% default the sheet read as a new screen. Leaving a strip of
      // the funnel showing is what keeps it a layer over it.
      maxHeightRatio={0.8}
      // Resize means "a different pack is in here", not "you ticked a box" — otherwise every tick
      // animated the whole commit and the price under your finger glided instead of changing.
      resizeKey={combo?.key ?? ''}
      footer={
        <VStack gap="none">
          {noteOpen && pricing.saving > 0 ? (
            <SavingNote amount={pricing.saving} onDismiss={() => setNoteOpen(false)} />
          ) : null}
          <SheetPriceFooter
            active={draft.length > 0}
            price={pricing.price}
            oldPrice={pricing.full}
            disabled={draft.length === 0}
            onPress={() => onApply(draft)}
          />
        </VStack>
      }
    >
      <VStack gap="none">
        {combo?.groups.map((group, gi) => (
          <VStack key={group.key} gap="none">
            {gi > 0 ? (
              <View
                style={{
                  height: t.borderWidth.hairline,
                  backgroundColor: t.border.default,
                  marginVertical: t.space.md,
                }}
              />
            ) : null}
            <HStack
              justify="space-between"
              align="center"
              gap="sm"
              style={{ paddingHorizontal: t.space.md, paddingBottom: t.space.xs }}
            >
              <Text variant="titleSmall">{group.title}</Text>
              {/* Only a multi-select group needs the rule spelled out; on a radio group it would be
                  telling you what the controls already say. */}
              {group.select === 'many' ? (
                <Badge tone="successSubtle">Select 1 or more</Badge>
              ) : null}
            </HStack>
            {group.items.map((item) => (
              <OptionRow
                key={item.key}
                item={item}
                select={group.select}
                checked={chosen.has(item.key)}
                onToggle={() => toggle(group, item.key)}
              />
            ))}
            <OptOutRow
              title={group.title}
              select={group.select}
              checked={groupEmpty(group)}
              onPress={() => clearGroup(group)}
            />
          </VStack>
        ))}

        {/* What every pack comes with, whatever you picked. */}
        <VStack gap="sm" style={{ paddingHorizontal: t.space.md, paddingTop: t.space.lg }}>
          <Text variant="labelMedium">Your Salon Experience</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
            {EXPERIENCE.map((e) => (
              <VStack
                key={e.label}
                gap="sm"
                style={{
                  // Two per row, sharing the gap between them.
                  width: `${50}%`,
                  flexGrow: 1,
                  flexBasis: 0,
                  minWidth: t.size['120'],
                  backgroundColor: t.background.secondary,
                  borderRadius: t.radius.default,
                  padding: t.size['12'],
                }}
              >
                <Icon name={e.icon} size="md" color={t.icon.primary} />
                <Text variant="bodyXSmall">{e.label}</Text>
              </VStack>
            ))}
          </View>
        </VStack>
      </VStack>
    </BottomSheet>
  );
}
