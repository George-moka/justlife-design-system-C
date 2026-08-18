import { img } from './tiles';
import React from 'react';
import { View, Text as RNText } from 'react-native';
import { Header } from '@justlife/ui/src/components/Header';
import { SearchBar } from '@justlife/ui/src/components/SearchBar';
import { ServiceCard } from '@justlife/ui/src/components/ServiceCard';
import { ProductCard } from '@justlife/ui/src/components/ProductCard';
import { AddOnsCard } from '@justlife/ui/src/components/AddOnsCard';
import { PillGroup } from '@justlife/ui/src/components/PillGroup';
import { NumberSelector } from '@justlife/ui/src/components/NumberSelector';
import { TimeSlotPicker } from '@justlife/ui/src/components/TimeSlotPicker';
import { DatePicker } from '@justlife/ui/src/components/DatePicker';
import { PromiseList } from '@justlife/ui/src/components/PromiseList';
import { Disclaimer } from '@justlife/ui/src/components/Disclaimer';
import { InfoCard } from '@justlife/ui/src/components/InfoCard';
import { VoucherCodeCard } from '@justlife/ui/src/components/VoucherCodeCard';
import { PriceDetails } from '@justlife/ui/src/components/PriceDetails';
import { ProfessionalCard } from '@justlife/ui/src/components/ProfessionalCard';
import { ThankYouCard } from '@justlife/ui/src/components/ThankYouCard';
import { CheckoutBar } from '@justlife/ui/src/components/CheckoutBar';
import { BottomNavigation } from '@justlife/ui/src/components/BottomNavigation';
import { StatusBadge } from '@justlife/ui/src/components/StatusBadge';
import { Card } from '@justlife/ui/src/components/Card';

const noop = () => {};
const clean = (o:any) => { const r:any={}; for (const k in o) if (o[k] !== undefined && o[k] !== null) r[k]=o[k]; return r; };
class NodeBoundary extends React.Component<any,{e:boolean}> {
  constructor(pr:any){super(pr);this.state={e:false};}
  static getDerivedStateFromError(){return {e:true};}
  render(){ if(this.state.e) return <View style={{padding:10,borderRadius:8,backgroundColor:"#FDECE9"}}><RNText style={{color:"#B23A2A",fontSize:11}}>Could not render: {String(this.props.name)}</RNText></View>; return this.props.children; }
}
type Entry = (p: any) => React.ReactElement | null;

export const REGISTRY: Record<string, Entry> = {
  Header: (p) => <Header title={p.title ?? 'Screen'} step={p.step} showBack={p.showBack ?? true} onBack={noop} actions={p.actions} />,
  SearchBar: (p) => <SearchBar value={p.value ?? ''} placeholder={p.placeholder ?? 'Search for a service'} onChangeText={noop} />,
  ServiceCard: (p) => <ServiceCard title={p.title ?? 'Home Cleaning'} price={p.price ?? 88} oldPrice={p.oldPrice} description={p.description} duration={p.duration} image={img(p.image)} discountLabel={p.discountLabel} cta={p.cta} selected={p.selected} />,
  ProductCard: (p) => <ProductCard title={p.title ?? 'Add-on'} price={p.price ?? 15} oldPrice={p.oldPrice} description={p.description} image={img(p.image)} defaultQuantity={p.quantity ?? 0} max={p.max} onQuantityChange={noop} />,
  AddOnsCard: (p) => <AddOnsCard title={p.title ?? 'Popular Add-ons'} items={p.items ?? []} {...p} />,
  PillGroup: (p) => <PillGroup options={p.options ?? []} value={p.value ?? (p.options?.[0] ?? '')} onChange={noop} />,
  NumberSelector: (p) => <NumberSelector count={p.count ?? 7} value={p.value ?? 1} onChange={noop} />,
  TimeSlotPicker: (p) => <TimeSlotPicker slots={p.slots ?? p.items ?? []} value={p.value} onChange={noop} />,
  DatePicker: (p) => <DatePicker {...p} />,
  PromiseList: (p) => <PromiseList items={p.items ?? []} title={p.title} />,
  Disclaimer: (p) => <Disclaimer icon={p.icon}>{p.message ?? p.children ?? ''}</Disclaimer>,
  InfoCard: (p) => <InfoCard tone={p.tone}>{p.text ?? p.children ?? ''}</InfoCard>,
  VoucherCodeCard: (p) => <VoucherCodeCard {...p} />,
  PriceDetails: (p) => <PriceDetails rows={p.rows ?? []} total={p.total} {...p} />,
  ProfessionalCard: (p) => <ProfessionalCard name={p.name ?? 'Professional'} rating={p.rating} {...p} />,
  ThankYouCard: (p) => <ThankYouCard title={p.title ?? 'Booking confirmed'} {...p} />,
  CheckoutBar: (p) => <CheckoutBar total={p.total ?? 0} cta={p.cta ?? 'Continue'} onCtaPress={noop} {...p} />,
  BottomNavigation: (p) => <BottomNavigation items={p.items ?? []} activeKey={p.activeKey} onTabPress={noop} {...p} />,
  StatusBadge: (p) => <StatusBadge tone={p.tone}>{p.children ?? p.label ?? 'Status'}</StatusBadge>,
  Card: (p) => <Card {...p}>{p.children}</Card>,
};

export function renderNode(node: any, key?: React.Key): React.ReactElement | null {
  if (!node || !node.component) return null;
  const entry = REGISTRY[node.component];
  if (!entry) {
    return (
      <View key={key} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0533D', backgroundColor: '#FDECE9' }}>
        <RNText style={{ color: '#B23A2A', fontSize: 12 }}>Unknown component: {String(node.component)}</RNText>
      </View>
    );
  }
  const el = entry(clean(node.props ?? {}));
  return el ? <NodeBoundary key={key} name={node.component}>{el}</NodeBoundary> : null;
}

export const REGISTERED_COMPONENTS = Object.keys(REGISTRY);
