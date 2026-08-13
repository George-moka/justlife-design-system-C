import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@justlife/ui';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { generateScreen, type ScreenSpec } from './src/generate';
import { renderNode } from './src/registry';

// The builder's own chrome uses plain hard-coded neutrals (it is not a DS screen).
// The DS components inside the preview render via ThemeProvider, so THEY stay on-token.
const UI = {
  bg: '#F5F6F8',
  panel: '#FFFFFF',
  field: '#FFFFFF',
  border: '#E4E7EC',
  ink: '#1A1A1A',
  sub: '#667085',
  muted: '#98A2B3',
  brand: '#00A9E0',
  brandInk: '#FFFFFF',
  errBg: '#FDECE9',
  errBorder: '#E0533D',
  errInk: '#B23A2A',
};

const EXAMPLES = [
  'A home cleaning booking screen: hours, professionals, cleaning materials, continue bar',
  'A frequency screen with One Time, Recurring and Monthly plans',
  'A checkout summary with payment method, voucher and price details',
  "A women's salon services list with add-ons and a checkout bar",
];

const F = { r: 'Poppins_400Regular', m: 'Poppins_500Medium', sb: 'Poppins_600SemiBold', b: 'Poppins_700Bold' };

function Builder() {
  const { width } = useWindowDimensions();
  const [prompt, setPrompt] = useState('');
  const [spec, setSpec] = useState<ScreenSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (text: string, asEdit: boolean) => {
      const p = text.trim();
      if (!p || loading) return;
      setLoading(true);
      setError(null);
      try {
        const next = await generateScreen(p, asEdit && spec ? spec : undefined);
        setSpec(next);
        if (asEdit) setPrompt('');
      } catch (e: any) {
        setError(e?.message ?? 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    },
    [loading, spec],
  );

  const isWide = width > 900;

  const panel = (
    <View style={{ flex: 1, minWidth: 320, padding: 20, gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: F.b, fontSize: 22, color: UI.ink }}>Justlife DS Builder</Text>
        <Text style={{ fontFamily: F.r, fontSize: 13, color: UI.sub }}>
          Describe a screen — it renders with the real @justlife/ui components.
        </Text>
      </View>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="e.g. A checkout summary with booking details, price and payment"
        placeholderTextColor={UI.muted}
        multiline
        style={{
          minHeight: 96,
          borderWidth: 1,
          borderColor: UI.border,
          borderRadius: 14,
          padding: 14,
          fontSize: 14,
          color: UI.ink,
          backgroundColor: UI.field,
          fontFamily: F.r,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => run(prompt, false)}
          disabled={loading}
          style={{ backgroundColor: UI.brand, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999, opacity: loading ? 0.6 : 1 }}
        >
          <Text style={{ color: UI.brandInk, fontFamily: F.sb }}>{loading ? 'Generating…' : 'Generate'}</Text>
        </Pressable>
        {spec && (
          <Pressable
            onPress={() => run(prompt, true)}
            disabled={loading}
            style={{ borderWidth: 1, borderColor: UI.brand, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999 }}
          >
            <Text style={{ color: UI.brand, fontFamily: F.sb }}>Apply edit</Text>
          </Pressable>
        )}
      </View>

      {error && (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: UI.errBg, borderWidth: 1, borderColor: UI.errBorder }}>
          <Text style={{ color: UI.errInk, fontSize: 12, fontFamily: F.r }}>{error}</Text>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: F.m, fontSize: 12, color: UI.muted }}>Try:</Text>
        {EXAMPLES.map((ex) => (
          <Pressable key={ex} onPress={() => setPrompt(ex)} style={{ borderWidth: 1, borderColor: UI.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ fontFamily: F.r, fontSize: 12, color: UI.sub }}>{ex}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const preview = (
    <View style={{ flex: 1, minWidth: 320, alignItems: 'center', padding: 20 }}>
      <View
        style={{
          width: 380,
          maxWidth: '100%',
          height: 760,
          backgroundColor: '#FFFFFF',
          borderRadius: 40,
          overflow: 'hidden',
          borderWidth: 10,
          borderColor: '#0b0b0b',
        }}
      >
        {loading && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={UI.brand} />
          </View>
        )}
        {!loading && !spec && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ color: UI.muted, textAlign: 'center', fontFamily: F.r }}>Your generated screen appears here</Text>
          </View>
        )}
        {!loading && spec && (
          <ScrollView contentContainerStyle={{ gap: 14, padding: 16 }}>
            {spec.nodes.map((n, i) => renderNode(n, i))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: UI.bg }}>
      <View style={{ flexDirection: isWide ? 'row' : 'column' }}>
        {panel}
        {preview}
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <Builder />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
