import type { Meta, StoryObj } from '@storybook/react';
import { Image, Text, View } from 'react-native';
import { GlassSurface, useTheme } from '../../index';
import { Phone } from '../../_dev/PhoneFrame';

/**
 * **GlassSurface** — the liquid-glass material (real Apple Liquid Glass via `GlassView` on iOS 26,
 * `expo-blur` frosted fallback on iOS<26/Android, CSS `backdrop-filter` on web here).
 *
 * Blur is PROVEN only by the DIFFERENCE between the bar over a busy backdrop and over plain white. If
 * both look identical, the glass failed. Over flat white a working glass and a broken one are
 * indistinguishable — which is exactly the trap the first attempt fell into.
 */
const meta = {
  title: 'Primitives/GlassSurface',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

const STRIPES = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C3FF', '#5856D6', '#FF2D55'];

/** Vivid, high-frequency, high-chroma backdrop so the blur is unmistakable. */
function BusyBackdrop() {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {STRIPES.map((c) => (
          <View key={c} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>
      <View style={{ position: 'absolute', top: 140, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#000', backgroundColor: '#fff', padding: 4 }}>
          tiny sharp text — should SMEAR but bleed colour under the bar
        </Text>
        <Text style={{ fontSize: 72, fontWeight: '900', color: '#000', marginTop: 12 }}>GLASS</Text>
      </View>
    </View>
  );
}

function GlassBar({ label, tint }: { label: string; tint?: 'regular' | 'strong' }) {
  const t = useTheme();
  return (
    <GlassSurface
      tint={tint}
      radius={t.radius.pill}
      style={{ position: 'absolute', left: t.space.md, right: t.space.md, bottom: t.size['48'], height: t.size['64'] }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: '600', color: '#000' }}>{label}</Text>
      </View>
    </GlassSurface>
  );
}

/**
 * PASS: under the bar the 7 stripes are visible but SOFTENED — each boundary is a sharp line outside
 * the bar and a several-pixel ramp inside it; the big GLASS word smears but its colour bleeds through;
 * the panel is a muddied blend, never a flat value. FAIL: stripes fully hidden (opaque / tint too high),
 * stripes perfectly crisp (no blur), or a flat colour block (solid fill).
 */
export const ProofOverBusy: StoryObj = {
  name: 'Proof · over busy content',
  render: () => (
    <Phone>
      <View style={{ flex: 1 }}>
        <BusyBackdrop />
        <GlassBar label="Glass over BUSY content" />
      </View>
    </Phone>
  ),
};

/** Strong tint over busy — confirms `tint="strong"` STILL shows the stripes (must not read solid). */
export const StrongTintOverBusy: StoryObj = {
  name: 'Proof · strong tint over busy',
  render: () => (
    <Phone>
      <View style={{ flex: 1 }}>
        <BusyBackdrop />
        <GlassBar label="tint=strong (stripes must still show)" tint="strong" />
      </View>
    </Phone>
  ),
};

/** Over a photo — the realistic case (media behind a floating bar). */
export const OverPhoto: StoryObj = {
  name: 'Proof · over a photo',
  render: () => (
    <Phone>
      <View style={{ flex: 1 }}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800' }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
        <GlassBar label="Glass over a photo" />
      </View>
    </Phone>
  ),
};

/**
 * CONTROL: over white the bar looks like a plain panel BY DESIGN — white can never prove blur (a
 * working and a broken glass are identical here). Only a visible difference vs ProofOverBusy proves it.
 */
export const ControlOverWhite: StoryObj = {
  name: 'Control · over white (can’t prove blur)',
  render: () => (
    <Phone>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <GlassBar label="Glass over WHITE (control)" />
      </View>
    </Phone>
  ),
};
