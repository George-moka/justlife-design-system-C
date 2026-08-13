import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import {
  AddressCard,
  Badge,
  BottomSheet,
  Button,
  Collapsible,
  InfoCard,
  Text,
  VStack,
  useTheme,
} from '../index';

/**
 * One professional-choice card — all the same fixed size; selected = brand outline + very light blue
 * fill (`background.selected`), matching CategoryCard. (Moved here from the home-cleaning screen so
 * every funnel — and the shared AddressSheet — composes the same card without circular imports.)
 */
export function ProChoice({
  selected,
  onPress,
  avatar,
  name,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  avatar: React.ReactNode;
  name: string;
  subtitle: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 124,
        // No fixed height: cards size to content and the row stretches them all to the tallest
        // (the returning-pro card with the "Served you on" line) — equal-size-rows, no magic number.
        padding: t.space.md,
        gap: t.size['8'],
        alignItems: 'center',
        borderRadius: t.radius.default,
        borderWidth: t.borderWidth.thin,
        borderColor: selected ? t.border.brandDefault : t.border.default,
        backgroundColor: selected ? t.background.selected : t.background.primary,
        opacity: pressed && !selected ? 0.7 : 1,
      })}
    >
      {avatar}
      <Text variant="labelBase" color="primary" numberOfLines={1}>
        {name}
      </Text>
      {subtitle}
    </Pressable>
  );
}

/** 56px circular avatar wrapper used inside {@link ProChoice}. */
export function ProAvatar({ children, bg }: { children: React.ReactNode; bg: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: t.size['56'],
        height: t.size['56'],
        borderRadius: t.radius.pill,
        overflow: 'hidden',
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

/**
 * Shared checkout address kit (AGENTS #46/#47) — used by EVERY funnel's checkout step:
 * - `ADDRESSES`: the user's saved addresses (same person across funnels, so one list);
 * - `AddressSection`: the "Service Address" block (label + `AddressCard` with in-card "Change");
 * - `AddressSheet`: the zone-aware change sheet — unavailable addresses render disabled with the
 *   reason on the card, and a professional conflict is resolved IN the sheet (warning + that zone's
 *   pros + Auto-assign), never by bouncing back to an earlier step.
 * Screen-level shared code (not DS-promoted yet — candidate for promotion at DS-reconciliation).
 * Address/zone/pro availability here is DEMO data.
 */

export type FunnelZone = 'A' | 'B';

export interface FunnelAddress {
  key: string;
  label: string;
  address: string;
  /** Availability zone — drives which named professionals can serve this address. */
  zone?: FunnelZone;
  /** `false` = the current service isn't offered here (disabled in the sheet, with the reason). */
  available: boolean;
  isDefault?: boolean;
}

export const ADDRESSES: FunnelAddress[] = [
  { key: 'home', label: 'Home', address: 'Marina Gate 2, Apt 1204, Dubai Marina, Dubai', zone: 'A', available: true, isDefault: true },
  { key: 'office', label: 'Office', address: 'One Central, Tower 3, Trade Centre 2, Dubai', zone: 'B', available: true },
  { key: 'villa', label: "Parents' Villa", address: 'Street 14b, Villa 22, Al Barsha 2, Dubai', available: false },
];

/** A named professional with the zones they serve. Auto-assign always serves every zone. */
export interface FunnelPro {
  key: string;
  name: string;
  rating: string;
  photo: string;
  zones: FunnelZone[];
  /** Optional line under the rating badge (e.g. "Recommended in your area", "Served you on 24 Nov"). */
  subtitle?: string;
}

/** The checkout "Service Address" block — current address with the in-card "Change" (#47). */
export function AddressSection({ address, onChange }: { address: FunnelAddress; onChange: () => void }) {
  return (
    <VStack gap="sm">
      <Text variant="labelMedium">Service Address</Text>
      <AddressCard
        label={address.label}
        address={address.address}
        defaultBadge={address.isDefault}
        trailing="Change"
        trailingTone="action"
        onPress={onChange}
      />
    </VStack>
  );
}

/** The Auto-assign choice card, shared by the sheet and the funnels' Date & Time steps. */
export function AutoAssignChoice({ selected, onPress }: { selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <ProChoice
      selected={selected}
      onPress={onPress}
      name="Auto-assign"
      avatar={
        <ProAvatar bg={t.background.brandDefault}>
          <Text variant="labelXSmall" style={{ color: t.text.onBrand }}>
            justlife
          </Text>
        </ProAvatar>
      }
      subtitle={
        <Text variant="bodyMicro" align="center" color="secondary" numberOfLines={2}>
          We&apos;ll assign the best professional
        </Text>
      }
    />
  );
}

/** A named-professional choice card fed from a {@link FunnelPro}. */
export function ProChoiceCard({ pro, selected, onPress }: { pro: FunnelPro; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <ProChoice
      selected={selected}
      onPress={onPress}
      name={pro.name}
      avatar={
        <ProAvatar bg={t.avatar.bg.neutral}>
          <Image source={{ uri: pro.photo }} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
        </ProAvatar>
      }
      subtitle={
        <VStack gap="xs" align="center">
          <Badge tone="rating" icon="star" iconFilled accessibilityLabel={`Rated ${pro.rating}`} style={{ alignSelf: 'center' }}>
            {pro.rating}
          </Badge>
          {pro.subtitle ? (
            <Text variant="bodyMicro" align="center" color="secondary" numberOfLines={2}>
              {pro.subtitle}
            </Text>
          ) : null}
        </VStack>
      }
    />
  );
}

/**
 * Change-address bottom sheet — see the module doc. `pros` + `serviceName` come from the host funnel
 * so the availability copy and the conflict picker match the service being booked.
 */
export function AddressSheet({
  open,
  current,
  pro,
  pros,
  serviceName,
  onApply,
  onClose,
}: {
  open: boolean;
  /** Current address key. */
  current: string;
  /** Current professional key (`'auto'` = Auto-assign, never conflicts). */
  pro: string;
  /** The funnel's named professionals (with zones). */
  pros: FunnelPro[];
  /** Shown in the unavailable-address reason, e.g. "Women's Salon isn't available at this address". */
  serviceName: string;
  onApply: (addressKey: string, newProKey?: string) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const [pending, setPending] = useState(current);
  const [pendingPro, setPendingPro] = useState<string | null>(null);
  // Re-sync each time the sheet opens (it stays mounted for the exit animation).
  useEffect(() => {
    if (open) {
      setPending(current);
      setPendingPro(null);
    }
  }, [open, current]);

  const target = ADDRESSES.find((a) => a.key === pending) ?? ADDRESSES[0];
  const currentPro = pros.find((p) => p.key === pro);
  // Auto-assign travels to every zone; a named pro must serve the new address's zone.
  const proConflict = !!currentPro && !!target.zone && !currentPro.zones.includes(target.zone);
  const zonePros = target.zone ? pros.filter((p) => p.zones.includes(target.zone!)) : [];

  return (
    <BottomSheet
      open={open}
      title="Service Address"
      onClose={onClose}
      // Same header treatment as the Home address sheet — both are card lists of saved addresses (#55).
      divider
      titleInset="content"
      footer={
        <Button
          variant="secondary"
          fullWidth
          disabled={proConflict && !pendingPro}
          onPress={() => onApply(pending, proConflict ? pendingPro ?? undefined : undefined)}
        >
          Apply
        </Button>
      }
    >
      {ADDRESSES.map((a) =>
        a.available ? (
          <AddressCard
            key={a.key}
            label={a.label}
            address={a.address}
            defaultBadge={a.isDefault}
            selected={pending === a.key}
            onPress={() => {
              setPending(a.key);
              setPendingPro(null);
            }}
          />
        ) : (
          <AddressCard
            key={a.key}
            label={a.label}
            address={a.address}
            disabled
            errorMessage={`${serviceName} isn't available at this address`}
          />
        ),
      )}

      {/* Professional conflict — resolved here, inside the sheet (#46). */}
      <Collapsible open={proConflict}>
        <VStack gap="sm" style={{ paddingTop: t.space.sm }}>
          <InfoCard tone="warning" icon="circle-alert">
            {`${currentPro?.name ?? 'Your professional'} isn't available at this address. Choose a new professional to continue.`}
          </InfoCard>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.size['8'], alignItems: 'stretch' }}>
            <AutoAssignChoice selected={pendingPro === 'auto'} onPress={() => setPendingPro('auto')} />
            {zonePros.map((p) => (
              <ProChoiceCard key={p.key} pro={p} selected={pendingPro === p.key} onPress={() => setPendingPro(p.key)} />
            ))}
          </ScrollView>
        </VStack>
      </Collapsible>
    </BottomSheet>
  );
}
