import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlagBadge } from './flag-badge';
import {
  useTheme,
  Text,
  HStack,
  VStack,
  Icon,
  Radio,
  Button,
  BottomSheet,
  AddressCard,
  SelectableCard,
} from '../index';

/**
 * **Home address sheet** — the two-step address selector from the Figma `Address Bottomsheet` section.
 *
 * Step 1 `address` — "Select your address": an **Add new** link, the saved addresses as selectable
 * rows (label · street · area, the area line turning brand when the row is selected), and a
 * **Manage address book** action pinned at the bottom. The country flag sits in the sheet's title row.
 *
 * Step 2 `country` — tapping that flag pushes "Select a country": the same sheet with a back chevron
 * and a flag+name row per country. It's the SAME sheet, not a second modal — the user never loses
 * their place (the address list is one back-tap away).
 *
 * Reuses `AddressCard` for the rows: its `note` line already renders brand-coloured when the row is
 * selected, which is exactly what the design does with the area line.
 */

/** Country flags come from Justlife's own CDN (the same assets the website serves). */
const FLAG_BASE = 'https://deax38zvkau9d.cloudfront.net/prod/assets/static/';
const flag = (code: string) => `${FLAG_BASE}${code}.svg`;

export interface HomeCountry {
  code: string;
  name: string;
}

export interface HomeAddress {
  key: string;
  /** Short label — "Home", "Office". */
  label: string;
  /** Street line. */
  street: string;
  /** Area / city line — brand-coloured while the row is selected. */
  area: string;
}

/** Countries Justlife operates in (demo order matches the design). */
export const HOME_COUNTRIES: HomeCountry[] = [
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'sa', name: 'Kingdom of Saudi Arabia' },
  { code: 'qa', name: 'Qatar' },
];

/** Saved addresses (demo content, verbatim from the Figma sheet). */
export const HOME_ADDRESSES: HomeAddress[] = [
  { key: 'home', label: 'Home', street: 'Al Sahab Tower 2, 1102', area: 'Dubai Marina, Dubai' },
  { key: 'office', label: 'Office', street: '110. Sherlock House 1, Sherlock Street…', area: 'Motor City, Dubai' },
  { key: 'old-office', label: 'Old Office', street: 'JLT Cluster F, Floor 15 Door 1212', area: 'Jumeirah Lake Towers, Dubai' },
];

export interface HomeAddressSheetProps {
  open: boolean;
  onClose: () => void;
  addresses?: HomeAddress[];
  countries?: HomeCountry[];
  /** Currently-selected address key. */
  value: string;
  /** Currently-selected country code. */
  country: string;
  onSelect: (key: string) => void;
  onSelectCountry: (code: string) => void;
  onAddNew?: () => void;
  onManage?: () => void;
}

export function HomeAddressSheet({
  open,
  onClose,
  addresses = HOME_ADDRESSES,
  countries = HOME_COUNTRIES,
  value,
  country,
  onSelect,
  onSelectCountry,
  onAddNew,
  onManage,
}: HomeAddressSheetProps) {
  const t = useTheme();
  const [step, setStep] = useState<'address' | 'country'>('address');
  // Always reopen on the address step — the country picker is a detour, not a state to remember.
  useEffect(() => {
    if (open) setStep('address');
  }, [open]);

  const active = countries.find((c) => c.code === country) ?? countries[0];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={step === 'address' ? 'Select your address' : 'Select a country'}
      onBack={step === 'country' ? () => setStep('address') : undefined}
      divider
      // Title + "Add new" line up with the text INSIDE the cards (16 gutter + 16 card padding), not with
      // the card edges — the Figma sheet's alignment.
      titleInset="content"
      titleAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Country: ${active.name}. Change country`}
          onPress={() => setStep(step === 'address' ? 'country' : 'address')}
          hitSlop={t.space.sm}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <FlagBadge code={active.code} size={t.size['32']} url={flag} />
        </Pressable>
      }
      footer={
        // Brand-outlined pill: a calm, low-emphasis navigation action (#33 outline), in the brand
        // colour the design uses for it. It **hugs its label and centres** — a full-width bar would read
        // as the sheet's primary action, which it isn't.
        <View style={{ alignItems: 'center' }}>
          <Button variant="outline" shape="pill" size="xs" tone="brand" onPress={onManage}>
            Manage address book
          </Button>
        </View>
      }
    >
      {step === 'address' ? (
        // The link sits a full `space.md` clear of the list; the cards themselves stack on `space.sm`.
        <VStack gap="md">
          {/* "Add new +" — a link, not a button: it opens the address form, it isn't the sheet's action.
              Inset to `space.xl` so it shares the title's text column, and set in the small label so it
              stays quieter than the address labels it sits above. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a new address"
            onPress={onAddNew}
            hitSlop={t.space.sm}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              marginLeft: t.space.md,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <HStack gap="xs" align="center">
              <Text variant="labelXSmall" color="link">
                Add new
              </Text>
              <Icon name="plus" size="sm" color={t.icon.brand} />
            </HStack>
          </Pressable>

          <VStack gap="sm">
            {addresses.map((a) => (
              <AddressCard
                key={a.key}
                typeIcon={null}
                label={a.label}
                address={a.street}
                note={a.area}
                selected={value === a.key}
                onPress={() => onSelect(a.key)}
              />
            ))}
          </VStack>
        </VStack>
      ) : (
        <VStack gap="sm">
          {countries.map((c) => (
            <SelectableCard
              key={c.code}
              selected={country === c.code}
              onPress={() => {
                onSelectCountry(c.code);
                setStep('address');
              }}
              accessibilityLabel={c.name}
            >
              <FlagBadge code={c.code} size={t.size['32']} ring={country === c.code} url={flag} />
              <Text variant="labelXSmall" style={{ flex: 1 }}>
                {c.name}
              </Text>
              {/* Non-interactive: the whole row is the tap target. */}
              <View pointerEvents="none">
                <Radio size="md" selected={country === c.code} accessibilityLabel={c.name} />
              </View>
            </SelectableCard>
          ))}
        </VStack>
      )}
    </BottomSheet>
  );
}
