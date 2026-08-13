import type { ReactNode } from 'react';
import type { Meta } from '@storybook/react';
import { View } from 'react-native';
import {
  Button,
  Card,
  Input,
  Text,
  Icon,
  Toggle,
  Checkbox,
  Radio,
  Badge,
  NoteChip,
  QuantityStepper,
  CategoryCard,
  SpecialInstructions,
  NotificationCard,
  InfoCard,
  FlexCard,
  ProductCard,
  BookCard,
  AddOnsCard,
  ServiceCard,
  RatedCard,
  CashbackCard,
  CreditPackageCard,
  ServiceTileRow,
  ReviewCard,
  RatingSummary,
  BookingStatusCard,
  VoucherCodeCard,
  PaymentMethodCard,
  PaymentLogo,
  Box,
  VStack,
  HStack,
  useTheme,
  sampleIcons,
} from '../index';
import { PlaceholderImage } from '../_dev/PlaceholderImage';

const meta = {
  title: 'Overview/Everything',
  // No autodocs entry for this page, so it is the first leaf in the sidebar and
  // Storybook opens straight onto it at the root URL.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;

function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <Card padded elevation="raised">
      <VStack gap="lg">
        <VStack gap="xs">
          <Text variant="headlineSmall">{title}</Text>
          <View style={{ height: 2, width: 40, backgroundColor: t.background.brandDefault }} />
        </VStack>
        {children}
      </VStack>
    </Card>
  );
}

function Swatches({ group }: { group: Record<string, unknown> }) {
  const t = useTheme();
  const entries = Object.entries(group).filter(([, v]) => typeof v === 'string') as [string, string][];
  return (
    <HStack gap="md" wrap>
      {entries.map(([name, value]) => (
        <VStack key={name} gap="xs" style={{ width: 120 }}>
          <View
            style={{
              height: 44,
              borderRadius: t.radius.md,
              backgroundColor: value,
              borderWidth: t.size['1'],
              borderColor: t.border.default,
            }}
          />
          <Text variant="bodyXSmall">{name}</Text>
        </VStack>
      ))}
    </HStack>
  );
}

const typeScale = [
  'displayMedium',
  'headlineLarge',
  'headlineSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodyBase',
  'bodyXSmall',
  'labelLarge',
  'labelMedium',
  'labelBase',
] as const;

export const Everything = () => {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.background.secondary, padding: 24 }}>
      <VStack gap="xl" style={{ maxWidth: 960, marginHorizontal: 'auto', width: '100%' }}>
        <Section title="Buttons">
          <VStack gap="lg">
            <HStack gap="md" align="center" wrap>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="pill">Pill</Button>
            </HStack>
            <HStack gap="md" align="center" wrap>
              <Button size="xs">XSmall</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
              <Button loading accessibilityLabel="Loading">
                Loading
              </Button>
            </HStack>
            <HStack gap="md" align="center" wrap>
              <Button leftIcon="plus">Add service</Button>
              <Button variant="secondary" rightIcon="chevron-right">
                Continue
              </Button>
              <Button variant="outline" leftIcon="search">
                Search
              </Button>
            </HStack>
          </VStack>
        </Section>

        <Section title="Inputs">
          <VStack gap="lg" style={{ maxWidth: 360 }}>
            <Input label="Email" placeholder="you@example.com" />
            <Input label="Phone" placeholder="+971 5x xxx xxxx" helperText="We'll text booking updates." />
            <Input label="Email" value="not-an-email" errorText="Enter a valid email address." />
            <Input label="Disabled" placeholder="Unavailable" disabled />
          </VStack>
        </Section>

        <Section title="Controls">
          <VStack gap="lg">
            <HStack gap="lg" align="center" wrap>
              <Toggle accessibilityLabel="toggle off" />
              <Toggle defaultValue accessibilityLabel="toggle on" />
              <Toggle disabled accessibilityLabel="toggle disabled" />
              <Toggle size="sm" defaultValue accessibilityLabel="toggle small" />
            </HStack>
            <HStack gap="lg" align="center" wrap>
              <Checkbox accessibilityLabel="checkbox" />
              <Checkbox defaultChecked accessibilityLabel="checkbox checked" />
              <Checkbox indeterminate accessibilityLabel="checkbox indeterminate" />
              <Checkbox disabled accessibilityLabel="checkbox disabled" />
              <Checkbox disabled defaultChecked accessibilityLabel="checkbox disabled checked" />
            </HStack>
            <HStack gap="lg" align="center" wrap>
              <Radio accessibilityLabel="radio" />
              <Radio defaultSelected accessibilityLabel="radio selected" />
              <Radio disabled accessibilityLabel="radio disabled" />
              <Radio disabled defaultSelected accessibilityLabel="radio disabled selected" />
            </HStack>
          </VStack>
        </Section>

        <Section title="Badges">
          <HStack gap="md" align="center" wrap>
            <Badge tone="rating" icon="star" iconFilled>
              5.0
            </Badge>
            <Badge tone="success">Save 33%</Badge>
            <Badge tone="neutral">New</Badge>
            <Badge tone="brand">Popular</Badge>
            <Badge tone="warning">Limited</Badge>
            <Badge tone="danger">Sold out</Badge>
          </HStack>
        </Section>

        <Section title="Chips & steppers">
          <HStack gap="lg" align="center" wrap>
            <NoteChip icon="bell-off">Don&apos;t ring the bell</NoteChip>
            <NoteChip icon="dog" defaultSelected>
              Pet at home
            </NoteChip>
            <QuantityStepper defaultValue={2} />
            <QuantityStepper defaultValue={0} />
          </HStack>
        </Section>

        <Section title="Cards">
          <HStack gap="lg" wrap align="flex-start">
            <CategoryCard label="Cleaning" image={<PlaceholderImage seed="cleaning" />} />
            <CategoryCard label="Summer Deals" image={<PlaceholderImage seed="summer" />} defaultSelected />
          </HStack>
          <HStack gap="lg" wrap>
            <Card style={{ width: 300 }}>
              <VStack gap="md">
                <VStack gap="xs">
                  <Text variant="titleLarge">Deep Cleaning</Text>
                  <Text color="secondary">3 hours · 2 professionals</Text>
                </VStack>
                <HStack justify="space-between" align="center">
                  <Text variant="headlineSmall" color="brand">
                    AED 189
                  </Text>
                  <Button rightIcon="chevron-right">Book</Button>
                </HStack>
              </VStack>
            </Card>
            <Card style={{ width: 300 }} elevation="overlay">
              <VStack gap="sm">
                <Icon name="check" size="lg" color={t.icon.brand} />
                <Text variant="titleLarge">Premium Cleaning</Text>
                <Text color="secondary">A sparkling home, handled by vetted pros.</Text>
              </VStack>
            </Card>
          </HStack>
        </Section>

        <Section title="Product cards">
          <HStack gap="lg" wrap align="flex-start">
            <ProductCard
              title="Finish Quantum"
              description="Be fully ready for the summer with the all-in-one pack."
              price="15"
              oldPrice="30"
              image={<PlaceholderImage seed="finish" />}
            />
            <ProductCard
              title="Comfort Softener"
              description="Long-lasting freshness for every wash."
              price="12"
              defaultQuantity={2}
              image={<PlaceholderImage seed="comfort" />}
            />
          </HStack>
        </Section>

        <Section title="Service cards">
          <Box background="primary" radius="lg" style={{ padding: t.space.md, maxWidth: 375 }}>
            <VStack gap="sm">
              <ServiceCard
                title="Classic Mani-Pedi"
                duration="120 min"
                description="A relaxing classic manicure and pedicure with premium products."
                price="100"
                oldPrice="140"
                discountLabel="20% off"
                cta="add"
                showChevron
                image={<PlaceholderImage seed="manipedi" />}
              />
              <ServiceCard
                title="Deep Cleaning"
                duration="180 min"
                price="189"
                defaultQuantity={2}
                selected
                image={<PlaceholderImage seed="deepclean" />}
                details={{
                  heading: 'What is included',
                  editLabel: 'Edit Combo',
                  items: ['Kitchen & bathrooms', 'All floors vacuumed & mopped', 'Eco-friendly products'],
                }}
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Add-ons">
          <HStack gap="md" wrap align="flex-start">
            <AddOnsCard title="Balcony Cleaning" price="15" oldPrice="10" image={<PlaceholderImage seed="balcony" />} />
            <AddOnsCard title="Ironing Service" price="20" defaultQuantity={1} image={<PlaceholderImage seed="ironing" />} />
          </HStack>
        </Section>

        <Section title="Book cards">
          <Box background="primary" padding="md" radius="lg" style={{ maxWidth: 375 }}>
            <VStack gap="sm">
              <BookCard
                title="Summer Ready Combo"
                details="Deep cleaning · 3 hours · 2 pros"
                price="100"
                oldPrice="399"
                image={<PlaceholderImage seed="combo" />}
              />
              <BookCard
                size="small"
                title="AC Filter Cleaning"
                price="100"
                oldPrice="399"
                image={<PlaceholderImage seed="ac" />}
              />
              <BookCard
                title="Home Deep Clean"
                details="Recommended for you"
                price="100"
                oldPrice="399"
                image={<PlaceholderImage seed="deep" />}
                professional={{ name: 'Leila', rating: '4.7', avatar: <PlaceholderImage seed="leila" /> }}
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Rated cards">
          <Box background="primary" padding="md" radius="lg" style={{ maxWidth: 375 }}>
            <VStack gap="sm">
              <RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={5} />
              <RatedCard
                title="You Rated Leila"
                ratingLabel="Your rating"
                rating={4}
                tipLabel="Tip added"
                tipAmount="10"
              />
              <RatedCard
                title="You Rated Leila"
                ratingLabel="Your rating"
                rating={5}
                tipLabel="Add a tip"
                onAddTip={() => {}}
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Payment methods">
          <Box background="primary" radius="lg" style={{ padding: t.space.md, maxWidth: 375 }}>
            <VStack gap="sm">
              <PaymentMethodCard
                icon={<PaymentLogo name="visa" label="Visa" />}
                title="Visa"
                number="•••• 4242"
                trailing="Default"
                onPress={() => {}}
              />
              <PaymentMethodCard
                icon={<Icon name="credit-card" size="lg" />}
                title="Credit / Debit Card"
                trailing="Add"
                onPress={() => {}}
              />
              <PaymentMethodCard
                icon={<Icon name="banknote" size="lg" />}
                title="Cash"
                trailing="Selected"
                onPress={() => {}}
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Voucher code">
          <Box background="primary" radius="lg" style={{ padding: t.space.md, maxWidth: 375 }}>
            <VStack gap="sm">
              <VoucherCodeCard title="Voucher Code" />
              <VoucherCodeCard title="Voucher Code" applied code="BOTIM432" discountLabel="20% off" />
            </VStack>
          </Box>
        </Section>

        <Section title="Cashback cards">
          <Box background="primary" padding="md" radius="lg" style={{ maxWidth: 375 }}>
            <VStack gap="md">
              <CashbackCard
                title="Cashback - Home Cleaning"
                amount="35.00"
                description="This credit is only for bookings that take place on Sunday, Tuesday, Wednesday, Thursday, Friday, Saturday."
                expiry="Expires on Jun 28, 2022"
              />
              <CashbackCard
                title="Cashback - Home Cleaning"
                amount="35.00"
                description="This credit is only for bookings that take place on Sunday, Tuesday, Wednesday, Thursday, Friday, Saturday."
                expiry="Expires on Jun 28, 2022"
                applied
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Credit package cards">
          <HStack gap="md" wrap align="flex-start">
            <CreditPackageCard tier="BASIC" saveLabel="Save 33%" pay="250" get="375" validity="60 day validity." />
            <CreditPackageCard tier="SMART" saveLabel="Save 50%" pay="500" get="750" validity="90 day validity." />
            <CreditPackageCard tier="SUPER" saveLabel="Save 60%" pay="1000" get="1600" validity="120 day validity." />
          </HStack>
        </Section>

        <Section title="Service tiles">
          <Box background="primary" radius="lg" style={{ paddingVertical: t.space.md, maxWidth: 375, overflow: 'hidden' }}>
            <ServiceTileRow
              title="Popular services"
              tiles={[
                { label: 'Home Cleaning', image: <PlaceholderImage seed="tile-clean" /> },
                { label: 'AC Maintenance', image: <PlaceholderImage seed="tile-ac" /> },
                { label: 'Handyman', image: <PlaceholderImage seed="tile-handy" /> },
                { label: 'Pest Control', image: <PlaceholderImage seed="tile-pest" /> },
              ]}
            />
          </Box>
        </Section>

        <Section title="Booking status">
          <Box background="primary" radius="lg" style={{ padding: t.space.md, maxWidth: 375, overflow: 'hidden' }}>
            <VStack gap="sm">
              <BookingStatusCard
                status="Professional Assigned"
                message="We’ll arrive between 13.00-14.00."
                professional={{ name: 'Leila Mary', rating: '4.7', avatar: <PlaceholderImage seed="leila" /> }}
              />
              <BookingStatusCard
                status="Cancelled"
                message="This booking was cancelled."
                cancelled
                professional={{ name: 'Leila Mary', rating: '4.7', avatar: <PlaceholderImage seed="leila" /> }}
              />
            </VStack>
          </Box>
        </Section>

        <Section title="Reviews">
          <VStack gap="lg" style={{ maxWidth: 420 }}>
            <RatingSummary rating="4.88" reviewCount="27K reviews" size="lg" />
            <ReviewCard
              reviewerName="Sarah M."
              rating="5.0"
              meta="May 15, 2026 • For 1.5 hours"
              review="Excellent service! The team was professional, friendly, and left the house spotless."
            />
            <ReviewCard
              reviewerName="Leila A."
              rating="4.5"
              meta="May 10, 2026 • AC maintenance"
              review="Great job overall, arrived on time and very thorough."
              media={[
                { image: <PlaceholderImage seed="rev2" /> },
                { image: <PlaceholderImage seed="rev3" />, video: true },
              ]}
            />
          </VStack>
        </Section>

        <Section title="Flex cards">
          <Box background="primary" padding="md" radius="lg" style={{ maxWidth: 420 }}>
            <VStack gap="sm">
              <FlexCard title="Summer Ready Combo" price="199" oldPrice="249" />
              <FlexCard title="Deep Cleaning add-on" price="89" defaultQuantity={2} />
            </VStack>
          </Box>
        </Section>

        <Section title="Info banners">
          <VStack gap="sm" style={{ maxWidth: 520 }}>
            <InfoCard tone="info" icon="info">
              Your booking is being processed.
            </InfoCard>
            <InfoCard tone="warning" icon="triangle-alert">
              Please be available 10 minutes before your slot.
            </InfoCard>
            <InfoCard tone="success" icon="circle-check">
              Payment received — your booking is confirmed.
            </InfoCard>
            <InfoCard tone="brand" icon="badge-percent">
              You unlocked 20% off your next service.
            </InfoCard>
          </VStack>
        </Section>

        <Section title="Notification card">
          <Box background="primary" padding="md" radius="lg" style={{ maxWidth: 440 }}>
            <NotificationCard
              title="Pre-Visit Assistance"
              body="Connect with the professional to ensure they bring the right tools and parts."
              time="Just now"
              unread
              avatar={<PlaceholderImage seed="pro" />}
            />
          </Box>
        </Section>

        <Section title="Special instructions">
          <Box background="tertiary" padding="lg" radius="xl" style={{ maxWidth: 420 }}>
            <SpecialInstructions
              title="Special instructions"
              value="Please leave the keys with the security guard at the lobby."
            />
          </Box>
        </Section>

        <Section title="Type scale">
          <VStack gap="sm">
            {typeScale.map((v) => (
              <Text key={v} variant={v}>
                {v} — Justlife
              </Text>
            ))}
          </VStack>
        </Section>

        <Section title="Icons — Lucide">
          <HStack gap="lg" wrap>
            {sampleIcons.map((name) => (
              <VStack key={name} gap="xs" align="center" style={{ width: 72 }}>
                <Icon name={name} size="lg" />
                <Text variant="bodyXSmall" color="secondary" align="center">
                  {name}
                </Text>
              </VStack>
            ))}
          </HStack>
        </Section>

        <Section title="Colours — background">
          <Swatches group={t.background} />
        </Section>
        <Section title="Colours — text">
          <Swatches group={t.text} />
        </Section>
        <Section title="Colours — border">
          <Swatches group={t.border} />
        </Section>
      </VStack>
    </View>
  );
};
