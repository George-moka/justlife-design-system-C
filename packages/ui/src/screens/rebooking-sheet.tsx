import React, { useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { VStack } from '../primitives/Stack';
import { BottomSheet } from '../components/BottomSheet';
import { TabGroup } from '../components/TabGroup';
import { BookAgainCard, type BookAgainPro } from '../components/BookAgainCard';
import proMaryMarielJo from '../assets/pros/mary-mariel-jo.webp';
import proMaryLeaSalon from '../assets/pros/mary-lea-salon.webp';
import proMaryLeaLab from '../assets/pros/mary-lea-lab.webp';
import proMahmood from '../assets/pros/mahmood.webp';

/**
 * **Book again sheet** — what Home's "See all" opens (Figma `Bottomsheet → Rebooking`).
 *
 * Every professional you've booked, filtered by service. The service filter is a `TabGroup` (the same
 * Figma "Tab Group" the component was built from — title plus a "You booked N times" sub-line), and
 * each row is the `BookAgainCard` Home uses, at full width instead of the carousel's fixed 260.
 *
 * Content is verbatim from the design. Where it disagreed with itself, the component won:
 * — the design hides the rating tag here but shows it on Home's identical card, so it stays (the same
 *   professional shouldn't lose their rating just because you opened a list of them);
 * — favourite + share were on two of the four cards; every row gets them.
 */

export interface RebookingPro extends BookAgainPro {
  key: string;
  /** Which service filter this professional belongs to. */
  serviceKey: string;
}

/** The professionals from the design, in its order. */
export const REBOOKING_PROS: RebookingPro[] = [
  {
    key: 'mary-mariel-jo',
    serviceKey: 'home-cleaning',
    name: 'Mary Mariel Jo',
    service: 'Home Cleaning',
    lastServed: 'Last served on Nov 14, 2025',
    category: 'clean',
    photo: proMaryMarielJo,
    rating: '4.9',
    bookedCount: 9,
  },
  {
    key: 'mary-lea-salon',
    serviceKey: 'womens-salon',
    name: 'Mary Lea',
    service: 'Salon at Home',
    lastServed: 'Last served on Nov 12, 2025',
    category: 'care',
    photo: proMaryLeaSalon,
    rating: '4.8',
    bookedCount: 9,
  },
  {
    key: 'mary-lea-lab',
    serviceKey: 'lab-tests',
    name: 'Mary Lea',
    service: 'Lab Tests at Home',
    lastServed: 'Last served on Nov 9, 2025',
    category: 'heal',
    photo: proMaryLeaLab,
    rating: '4.7',
    bookedCount: 9,
  },
  {
    key: 'mahmood',
    serviceKey: 'handymen',
    name: 'Mahmood',
    service: 'Handymen Services',
    lastServed: 'Last served on Nov 8, 2025',
    category: 'assist',
    photo: proMahmood,
    rating: '4.9',
    bookedCount: 9,
  },
];

/** Service filters, verbatim from the design (the counts are the customer's booking history). */
const FILTERS = [
  { key: 'all', label: 'All Bookings', subtitle: 'You booked 99 times' },
  { key: 'home-cleaning', label: 'Home Cleaning', subtitle: 'You booked 18 times' },
  { key: 'womens-salon', label: "Women's Salon", subtitle: 'You booked 13 times' },
];

export interface RebookingSheetProps {
  open?: boolean;
  onClose?: () => void;
  /** Rebook this professional. */
  onRebook?: (key: string) => void;
  pros?: RebookingPro[];
}

export function RebookingSheet({ open = true, onClose, onRebook, pros = REBOOKING_PROS }: RebookingSheetProps) {
  const t = useTheme();
  const SHEET_GUTTER = t.space.md;
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const shown = useMemo(() => (filter === 'all' ? pros : pros.filter((p) => p.serviceKey === filter)), [filter, pros]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Book again"
      divider
      headerBleed
      header={<TabGroup scrollable gutter={SHEET_GUTTER} items={FILTERS} activeKey={filter} onChange={setFilter} />}
    >
      <VStack gap="sm">
        {shown.map((pro) => (
          <BookAgainCard
            key={pro.key}
            pro={pro}
            onPress={() => onRebook?.(pro.key)}
            favorite={favorites.includes(pro.key)}
            onFavorite={() =>
              setFavorites((cur) => (cur.includes(pro.key) ? cur.filter((k) => k !== pro.key) : [...cur, pro.key]))
            }
            onShare={() => {}}
          />
        ))}
      </VStack>
    </BottomSheet>
  );
}
