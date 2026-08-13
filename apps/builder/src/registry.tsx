import React from 'react';
import { View, Text as RNText } from 'react-native';
import {
  Header,
  SearchBar,
  ServiceCard,
  ProductCard,
  AddOnsCard,
  PillGroup,
  NumberSelector,
  TimeSlotPicker,
  DatePicker,
  PromiseList,
  Disclaimer,
  InfoCard,
  VoucherCodeCard,
  PriceDetails,
  ProfessionalCard,
  ThankYouCard,
  CheckoutBar,
  BottomNavigation,
  StatusBadge,
  Card,
} from '@justlife/ui';

const noop = () => {};

// Each entry adapts a generated { ...props } object into the real component's props.
// Preview is static, so controlled components get their `value` from props plus a no-op handler.
type Entry = (p: any) => React.ReactElement | null;

export const REGISTRY: Record<string, Entry> = {
  Header: (p) => <Header title={p.title ?? 'Screen'} step={p.step} showBack={p.showBack ?? true} onBack={noop} actions={p.actions} />,

  SearchBar: (p) => <SearchBar value={p.value ?? ''} placeholder={p.placeholder ?? 'Search for a service'} onChangeText={noop} />,

  ServiceCard: (p) => (
    <ServiceCard
      title={p.title ?? 'Home Cleaning'}
      price={p.price ?? 88}
      oldPrice={p.oldPrice}
      description={p.description}
      duration={p.duration}
      image={p.image}
      discountLabel={p.discountLabel}
      cta={p.cta}
      selected={p.selected}
    />
  ),

  ProductCard: (p) => (
    <ProductCard title={p.title ?? 'Add-on'} price={p.price ?? 15} oldPrice={p.oldPrice} description={p.description} image={p.image} defaultQuantity={p.quantity ?? 0} max={p.max} onQuantityChange={noop} />
  ),

  AddOnsCard: (p) => <AddOnsCard title={p.title ?? 'Popular Add-ons'} items={p.items ?? []} {...p} />,

  PillGroup: (p) => <PillGroup options={p.options ?? []} value={p.value ?? (p.options?.[0] ?? '')} onChange={noop} />,

  NumberSelector: (p) => <NumberSelector count={p.count ?? 7} value={p.value ?? 1} onChange={noop} />,

  TimeSlotPicker: (p) => <TimeSlotPicker slots={p.slots ?? []} value={p.value} onChange={noop} />,

  DatePicker: (p) => <DatePicker days={p.days ?? []} value={p.value} onChange={noop} />,

  PromiseList: (p) => <PromiseList items={p.items ?? []} title={p.title} />,

  Disclaimer: (p) => <Disclaimer action={p.action}>{p.children ?? ''}</Disclaimer>,

  InfoCard: (p) => (
    <InfoCard tone={p.tone} action={p.action}>
      {p.children ?? ''}
    </InfoCard>
  ),

  VoucherCodeCard: (p) => <VoucherCodeCard title={p.title} applied={p.applied} code={p.code} discountLabel={p.discountLabel} />,

  PriceDetails: (p) => <PriceDetails title={p.title} rows={p.rows ?? []} total={p.total ?? 0} paymentMethod={p.paymentMethod} />,

  ProfessionalCard: (p) => <ProfessionalCard category={p.category ?? 'Cleaning'} name={p.name ?? 'Leila Mary'} rating={p.rating} photo={p.photo} />,

  ThankYouCard: (p) => <ThankYouCard title={p.title ?? 'Booking confirmed'} message={p.message ?? ''} professional={p.professional} />,

  CheckoutBar: (p) => <CheckoutBar total={p.total ?? 0} oldTotal={p.oldTotal} totalLabel={p.totalLabel} cta={p.cta ?? 'Next'} onCtaPress={noop} />,

  BottomNavigation: (p) => <BottomNavigation items={p.items ?? []} activeKey={p.activeKey ?? p.items?.[0]?.key ?? 'home'} onTabPress={noop} />,

  StatusBadge: (p) => <StatusBadge tone={p.tone}>{p.children ?? 'Confirmed'}</StatusBadge>,

  Card: (p) => <Card>{p.children ?? null}</Card>,
};

// Renders one generated node, or a labelled placeholder if the component isn't in the registry.
export function renderNode(node: { component: string; props?: any }, key: React.Key) {
  const entry = REGISTRY[node.component];
  if (!entry) {
    return (
      <View key={key} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0533D', backgroundColor: '#FDECE9' }}>
        <RNText style={{ color: '#B23A2A', fontSize: 12, fontWeight: '600' }}>Unknown component: {node.component}</RNText>
      </View>
    );
  }
  try {
    return <View key={key}>{entry(node.props ?? {})}</View>;
  } catch (e) {
    return (
      <View key={key} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0533D' }}>
        <RNText style={{ color: '#B23A2A', fontSize: 12 }}>{node.component} failed to render</RNText>
      </View>
    );
  }
}

export const REGISTERED_COMPONENTS = Object.keys(REGISTRY);
