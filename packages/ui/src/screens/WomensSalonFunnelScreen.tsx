import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  Header,
  PageShell,
  ScreenAurora,
  Badge,
  Card,
  CheckoutBar,
  BottomSheet,
  StepIndicator,
  AddOnsCard,
  InfoCard,
  PaymentMethodCard,
  PaymentLogo,
  PriceDetails,
  type PriceDetailsRow,
  Button,
  DatePicker,
  TimeSlotPicker,
  Question,
  QuantityStepper,
  SwipeToDelete,
  MiniActionCard,
  Disclaimer,
  Dirham,
  Text,
  HStack,
  VStack,
  Icon,
  useTheme,
} from '../index';
import { EdgeSwipeBack } from '../primitives/EdgeSwipeBack';
import bannerBestsellers from '../assets/salon-banners/bestsellers.webp';
import bannerBundles from '../assets/salon-banners/bundles.webp';
import bannerNails from '../assets/salon-banners/nails.webp';
import bannerHairRemoval from '../assets/salon-banners/hair-removal.webp';
import bannerFacial from '../assets/salon-banners/facial.webp';
import bannerHair from '../assets/salon-banners/hair.webp';
import bannerHenna from '../assets/salon-banners/henna.webp';
import bannerMassage from '../assets/salon-banners/massage.webp';
import bannerCombos from '../assets/salon-banners/combos.webp';
import bannerMakeYourOwnCombo from '../assets/salon-banners/make-your-own-combo.webp';
import tileMakeYourOwnCombo from '../assets/salon-banners/make-your-own-combo-tile.webp';
import { COMBOS, ComboCard, ComboSheet, comboPricing, type SalonCombo } from './salon-combo';
import { Price } from './funnel-money';
import { SheetPriceFooter } from './funnel-sheet-footer';
import {
  ChangePaymentSheet,
  VoucherSheet,
  CancellationPolicySheet,
  MissingLogo,
  PRO_PHOTOS,
} from './HomeCleaningFunnelScreen';
import { HeroVideo } from './hero-video';
import {
  ADDRESSES,
  AddressSection,
  AddressSheet,
  AutoAssignChoice,
  ProChoiceCard,
  type FunnelPro,
} from './funnel-address';

/**
 * The **Women's Salon booking funnel** (4 steps) — the first **flex funnel**: unlike the pinned
 * home-cleaning shell, step 1 uses `PageShell`'s default **collapsing** mode — a video hero band that
 * scrolls away while the header collapses to a solid bar and the category chips pin under it
 * (`stickyRow`). Steps 2–4 (Popular Add-ons · Date & Time · Checkout) reuse the pinned aurora shell and
 * the shared funnel pieces (`ProChoice`, payment/voucher/policy sheets) from the home-cleaning funnel.
 *
 * Content is **verbatim** from the live justlife.com Women's Salon flex funnel (categories, services,
 * descriptions, prices) + the user's app screenshots (options sheet, add-ons, checkout). Photos/video
 * stream from Justlife's own CDN (same pattern as the home-cleaning add-ons). Anything whose real
 * content we don't have yet renders as a GREEN placeholder.
 */

// ── content (verbatim from justlife.com /beauty-for-her/checkout/flex + app screenshots) ─────────

const CDN = 'https://deax38zvkau9d.cloudfront.net/prod/assets/';
const img = (path: string, w = 320) => `${CDN}images/${path}?f=webp&w=${w}`;

/** The step-1 hero video (the funnel's "Indulge in luxury beauty services at home" loop). */
export const SALON_VIDEO = `${CDN}videos/service-details-intro/1772598344funnelwsalon.mp4`;

type CategoryKey =
  | 'make-your-own-combo'
  | 'bestsellers'
  | 'bundles'
  | 'nails'
  | 'hair-removal'
  | 'facial'
  | 'hair'
  | 'henna'
  | 'massage'
  | 'combos';

/**
 * A category's thumbnail is normally a CDN url; "Make Your Own Combo" is the one whose art we hold
 * locally (a bundled require, i.e. a number), so the tiles take either.
 */
type ThumbSource = string | number;

/** A url has to be wrapped in `{ uri }`; a bundled asset is already a source. */
const thumbSource = (image: ThumbSource) => (typeof image === 'string' ? { uri: image } : image);

const CATEGORIES: { key: CategoryKey; label: string; image: ThumbSource }[] = [
  {
    key: 'make-your-own-combo',
    label: 'Make Your Own Combo',
    image: tileMakeYourOwnCombo,
  },
  {
    key: 'bestsellers',
    label: 'Bestsellers',
    image: img('attribute-categories/1773845001categorythumbnails_bestsellers.webp'),
  },
  {
    key: 'bundles',
    label: 'Bundles',
    image: img('attribute-categories/1768903046categorythumbnailsupdated_combos.webp'),
  },
  { key: 'nails', label: 'Nails', image: img('attribute-categories/1759400530nails.webp') },
  {
    key: 'hair-removal',
    label: 'Hair Removal',
    image: img('attribute-categories/1759400643hairremoval.webp'),
  },
  { key: 'facial', label: 'Facial', image: img('attribute-categories/1759400499facial.webp') },
  {
    key: 'hair',
    label: 'Hair',
    image: img('attribute-categories/1759400585bundle_(upto15_off).webp'),
  },
  {
    key: 'henna',
    label: 'Henna',
    image: img('attribute-categories/1773320548categorythumbnails_henna.webp'),
  },
  { key: 'massage', label: 'Massage', image: img('attribute-categories/1759400607massage.webp') },
  { key: 'combos', label: 'Combos', image: img('attribute-categories/1759400438combos.webp') },
];

/** Category benefit banners — only where we have the real copy (app screenshots). */
// NOTE: the CDN "category_*" banner art has the full composite (photo + text) baked in — using it
// would double the copy, like the video caption. The banners therefore use the CLEAN category
// thumbnails for the photo side and draw the (verbatim) bullets in DS type.
/**
 * The category banner is ONE CRM image — headline, bullets, badge and the curved photo are baked into
 * it by marketing (see the live funnel: `assets/images/attribute-categories/*?w=1024`). We used to
 * rebuild it from a thumbnail plus text, which meant our copy could drift from what the business
 * actually ships and the curve was gone. 1024 x 336 exports, so the slot is a 3.048 ratio.
 */
const BANNERS: Partial<Record<CategoryKey, number>> = {
  'make-your-own-combo': bannerMakeYourOwnCombo,
  bestsellers: bannerBestsellers,
  bundles: bannerBundles,
  nails: bannerNails,
  'hair-removal': bannerHairRemoval,
  facial: bannerFacial,
  hair: bannerHair,
  henna: bannerHenna,
  massage: bannerMassage,
  combos: bannerCombos,
};
const BANNER_ASPECT = 1024 / 336;
/** The combo banner is a different CRM export, so it carries its own ratio rather than being squashed. */
const BANNER_ASPECTS: Partial<Record<CategoryKey, number>> = {
  'make-your-own-combo': 739 / 256,
};

interface SalonService {
  key: string;
  category: CategoryKey;
  name: string;
  desc: string;
  /** "Starts at" price for multi-option services; the exact price otherwise. */
  price: number;
  oldPrice?: number;
  /** Number of sub-options; when >1 the card opens the options sheet. */
  options?: number;
  /** Minutes, where the source shows one ("90 min • …"). */
  minutes?: number;
  image: string;
}

const SERVICES: SalonService[] = [
  // Bestsellers
  {
    key: 'bs-gel-mani-pedi',
    category: 'bestsellers',
    name: 'Gel Mani-Pedi',
    desc: 'Polished, glossy gel nails for hands & feet with long-lasting shine.',
    price: 99,
    options: 2,
    image: img('attribute-groups/1772792758attributesgrouping_gel-polishmanicure&pedicure.webp'),
  },
  {
    key: 'bs-princess',
    category: 'bestsellers',
    name: 'Princess Mani-Pedi (7–16y)',
    desc: 'Gentle nail care with fun polish colors, specially designed for young girls.',
    price: 49,
    options: 2,
    image: img('attribute-groups/1773037223attributesgrouping_princessmanicure&pedicure.webp'),
  },
  {
    key: 'bs-classic-combo',
    category: 'bestsellers',
    name: 'Classic Mani-Pedi Combo',
    desc: 'Bestselling Classic Mani-Pedi Combo with Essie & Kinetics shades.',
    price: 109,
    oldPrice: 180,
    minutes: 90,
    image: img(
      'attribute-contents/1776237917servicethumbnails_bestsellers_classicmani-pedicombo.jpeg',
    ),
  },
  {
    key: 'bs-gel-combo',
    category: 'bestsellers',
    name: 'Gel Polish Mani-Pedi Combo',
    desc: 'Achieve stunning, long-lasting nails with our Gel Manicure & Pedicure.',
    price: 169,
    oldPrice: 260,
    image: img('attribute-contents/1759388813gelpolishmani-pedicombo.jpg'),
  },
  {
    key: 'bs-polish-free',
    category: 'bestsellers',
    name: 'Polish-Free Mani-Pedi',
    desc: 'Classic Manicure & Pedicure treatment for shiny & clean nails without polish.',
    price: 99,
    oldPrice: 180,
    image: img('attribute-contents/1774254269attributesgrouping_polishfreemanicure&pedicure.webp'),
  },
  {
    key: 'bs-gel-classic',
    category: 'bestsellers',
    name: 'Gel Mani & Classic Pedi',
    desc: 'Long-lasting perfect nails with our Gel Mani & Classic Pedi combo.',
    price: 149,
    oldPrice: 210,
    image: img('attribute-contents/17685742221759392077gelpolish&classiccombo.webp'),
  },
  {
    key: 'bs-stickers',
    category: 'bestsellers',
    name: 'Nail Art Stickers',
    desc: 'Enhance your nails instantly with elegant nail art stickers this Eid.',
    price: 15,
    oldPrice: 20,
    image: img('attribute-contents/1776229328servicethumbnails_nailartstickers.png'),
  },
  {
    key: 'bs-classic-pedi',
    category: 'bestsellers',
    name: 'Classic Pedicure',
    desc: 'Step lighter with a refreshing Classic Pedicure glow.',
    price: 85,
    oldPrice: 100,
    image: img('attribute-contents/1776229757servicethumbnails_nails_classicpedicure.png'),
  },
  {
    key: 'bs-brazilian',
    category: 'bestsellers',
    name: 'Brazilian Wax',
    desc: 'Own your confidence with a gentle Brazilian Wax.',
    price: 89,
    oldPrice: 110,
    image: img('attribute-contents/17686344541759421329brazillianwax(1).webp'),
  },
  // Bundles
  {
    key: 'bd-mani-foot',
    category: 'bundles',
    name: 'Mani-Pedi & Foot Massage',
    desc: 'Regular Mani-Pedi + Foot Massage sessions at a lower per-session price.',
    price: 199,
    options: 2,
    image: img(
      'attribute-groups/17779653751776238179servicethumbnails_bestsellers_classicmani-pedicombo.webp',
    ),
  },
  {
    key: 'bd-mani-blow',
    category: 'bundles',
    name: 'Mani-Pedi + Blow Dry',
    desc: 'Plan your glow-ups. Mani-Pedi + Blow Dry at a better per-session value.',
    price: 399,
    options: 3,
    image: img(
      'attribute-groups/17779659361772791630attributesgrouping_blow-dry&curls(shorthair).webp',
    ),
  },
  // Nails
  {
    key: 'nl-classic',
    category: 'nails',
    name: 'Classic Mani-Pedi',
    desc: 'Essential manicure & pedicure care for clean, polished nails.',
    price: 69,
    options: 3,
    image: img(
      'attribute-groups/17779670751776238179servicethumbnails_bestsellers_classicmani-pedicombo.webp',
    ),
  },
  {
    key: 'nl-gel',
    category: 'nails',
    name: 'Gel Mani-Pedi',
    desc: 'Polished, glossy gel nails for hands & feet with long-lasting shine.',
    price: 99,
    options: 2,
    image: img('attribute-groups/1772788617attributesgrouping_gel-polishmanicure&pedicure.webp'),
  },
  {
    key: 'nl-polish-free',
    category: 'nails',
    name: 'Polish-Free Mani-Pedi',
    desc: 'Classic Manicure & Pedicure treatment for shiny & clean nails without polish.',
    price: 69,
    options: 3,
    image: img('attribute-groups/1772789391attributesgrouping_polishfreemanicure&pedicure.webp'),
  },
  {
    key: 'nl-polish-change',
    category: 'nails',
    name: 'Polish Change',
    desc: 'Refresh your nails with a quick polish change for hands or feet.',
    price: 29,
    options: 4,
    image: img('attribute-groups/1776256212french.jpeg'),
  },
  {
    key: 'nl-french-gel',
    category: 'nails',
    name: 'French Gel Nails',
    desc: 'Classic French gel nails with elegant, long-lasting shine.',
    price: 109,
    options: 2,
    image: img('attribute-groups/1773230388attributesgrouping_french.webp'),
  },
  {
    key: 'nl-cut-file',
    category: 'nails',
    name: 'Cut & File',
    desc: 'Basic nail grooming for hands & feet with cut, shape, and smooth finish.',
    price: 19,
    options: 2,
    image: img('attribute-groups/1776257292cutnfile.jpeg'),
  },
  {
    key: 'nl-breathable',
    category: 'nails',
    name: 'Breathable Mani-Pedi',
    desc: 'Refresh your nails with Halal breathable polish for lasting shine & comfort.',
    price: 69,
    options: 2,
    image: img('attribute-groups/1772790097attributesgrouping_breathablemanicure&pedicure.webp'),
  },
  {
    key: 'nl-princess',
    category: 'nails',
    name: 'Princess Mani-Pedi (7–16y)',
    desc: 'Gentle nail care with fun polish colors, specially designed for young girls.',
    price: 49,
    options: 2,
    image: img('attribute-groups/1775884772chatgptimagejun16,2025,01_37_10pm3.png'),
  },
  {
    key: 'nl-gel-app',
    category: 'nails',
    name: 'Gel Polish Application',
    desc: 'Apply long-lasting Gel Polish for stunning hands or feet.',
    price: 59,
    options: 2,
    image: img('attribute-groups/1782996646parentgelpolish.png'),
  },
  {
    key: 'nl-gel-removal',
    category: 'nails',
    name: 'Gel Polish Removal',
    desc: 'Quick & easy French/Gel Polish Removal for hands or feet in just 20 mins.',
    price: 25,
    oldPrice: 40,
    image: img(
      'attribute-contents/1779375628servicethumbnails_nails_gelpolishremoval(handsorfeet).webp',
    ),
  },
  {
    key: 'nl-stickers',
    category: 'nails',
    name: 'Nail Art Stickers',
    desc: 'Enhance your nails instantly with elegant nail art stickers.',
    price: 15,
    oldPrice: 20,
    image: img('attribute-contents/1776230545servicethumbnails_nailartstickers.png'),
  },
  // Hair Removal
  {
    key: 'hr-full-body',
    category: 'hair-removal',
    name: 'Full Body Waxing',
    desc: 'Head-to-toe waxing for smooth, long-lasting results.',
    price: 179,
    options: 2,
    image: img(
      'attribute-groups/1773231132servicethumbnails_hairremoval_fullbody&brazillianwaxing.webp',
    ),
  },
  {
    key: 'hr-leg',
    category: 'hair-removal',
    name: 'Leg Waxing',
    desc: 'Smooth, hair-free legs with professional waxing care.',
    price: 59,
    options: 2,
    image: img('attribute-groups/1773231373servicethumbnails_hairremoval_fulllegswaxing.webp'),
  },
  {
    key: 'hr-threading',
    category: 'hair-removal',
    name: 'Threading',
    desc: 'Expert threading services for smooth, perfect skin.',
    price: 29,
    options: 4,
    image: img('attribute-groups/1772790659attributesgrouping_threading.webp'),
  },
  {
    key: 'hr-brazilian',
    category: 'hair-removal',
    name: 'Brazilian Wax',
    desc: 'Own your confidence with a gentle Brazilian Wax.',
    price: 89,
    oldPrice: 110,
    image: img('attribute-contents/1759421298brazillianwax(1).webp'),
  },
  {
    key: 'hr-underarms',
    category: 'hair-removal',
    name: 'Underarms Waxing',
    desc: 'Silky smooth underarms with gentle wax & aftercare.',
    price: 29,
    oldPrice: 35,
    image: img('attribute-contents/1759414964underarmswaxing(1).webp'),
  },
  {
    key: 'hr-full-arms',
    category: 'hair-removal',
    name: 'Full Arms & Underarms Waxing',
    desc: 'Stay effortlessly smooth with silky full arms & underarms.',
    price: 69,
    oldPrice: 90,
    image: img('attribute-contents/1759420482fullarms&underarmswaxing(1).webp'),
  },
  {
    key: 'hr-upper-lip',
    category: 'hair-removal',
    name: 'Upper Lip Wax',
    desc: 'Gentle removal of upper lip hair using hard wax for a smooth & clean finish.',
    price: 29,
    oldPrice: 39,
    image: img('attribute-contents/1774679889servicethumbnails_hairremoval_upperlipwaxing.webp'),
  },
  {
    key: 'hr-stomach',
    category: 'hair-removal',
    name: 'Stomach Waxing',
    desc: 'Smooth stomach hair removal using Depiléve strip wax for clean, long-lasting results.',
    price: 59,
    oldPrice: 69,
    image: img(
      'attribute-contents/1774619209servicethumbnails_hairremoval_partbodywaxing(stomach).webp',
    ),
  },
  {
    key: 'hr-back',
    category: 'hair-removal',
    name: 'Back Waxing',
    desc: 'Smooth back hair removal using Depiléve strip wax for clean, long-lasting results.',
    price: 79,
    oldPrice: 89,
    image: img(
      'attribute-contents/1774620009servicethumbnails_hairremoval_partbodywaxing(back).webp',
    ),
  },
  {
    key: 'hr-forehead',
    category: 'hair-removal',
    name: 'Forehead Threading',
    desc: 'Precise threading to remove forehead hair for a clean & well-defined look.',
    price: 39,
    oldPrice: 49,
    image: img('attribute-contents/1774680441servicethumbnails_hairremoval_foreheadthreading.webp'),
  },
  {
    key: 'hr-neck',
    category: 'hair-removal',
    name: 'Neck Threading',
    desc: 'Gentle threading to remove neck hair for a clean & smooth finish.',
    price: 49,
    oldPrice: 59,
    image: img('attribute-contents/1774680905servicethumbnails_hairremoval_neckthreading.webp'),
  },
  // Facial
  {
    key: 'fc-dermalogica',
    category: 'facial',
    name: 'Dermalogica Facial',
    desc: 'Rejuvenating Dermalogica facials, offering customized treatments for glowing skin.',
    price: 169,
    options: 2,
    image: img('attribute-groups/1772790921attributesgrouping_dermalogicafacial&cleanup.webp'),
  },
  {
    key: 'fc-herbal',
    category: 'facial',
    name: 'Herbal Facial',
    desc: 'Natural herbal facials to cleanse, refresh, & restore your skin’s glow.',
    price: 89,
    options: 2,
    image: img('attribute-groups/1772791184attributesgrouping_herbalcleanup.webp'),
  },
  {
    key: 'fc-back',
    category: 'facial',
    name: 'Back Facial',
    desc: 'Pamper your back with the Dr. Renaud Back Facial for a radiant glow.',
    price: 250,
    oldPrice: 350,
    image: img('attribute-contents/1759403790backfacial(1).webp'),
  },
  // Hair
  {
    key: 'ha-blowdry',
    category: 'hair',
    name: 'Blowdry - Straight, In/Out Curls',
    desc: 'Shiny, bouncy curls styled to suit short to extra long hair.',
    price: 99,
    options: 4,
    image: img('attribute-groups/1772791630attributesgrouping_blow-dry&curls(shorthair).webp'),
  },
  {
    key: 'ha-flat-iron',
    category: 'hair',
    name: 'Flat Iron Straightening',
    desc: 'Sleek, smooth straightening for short to extra-long hair.',
    price: 119,
    options: 4,
    image: img(
      'attribute-groups/1776076808attributesgrouping_attributesgrouping_longhairstraitening.webp',
    ),
  },
  // Henna
  {
    key: 'he-hands-wrist',
    category: 'henna',
    name: 'Hands (Front & back up to wrist)',
    desc: 'Achieve flawless henna patterns on both hands with precision stencil designs.',
    price: 79,
    oldPrice: 89,
    image: img('attribute-contents/1773144328handshenna(front&back,uptowrist)usingstencil.webp'),
  },
  {
    key: 'he-hands-front',
    category: 'henna',
    name: 'Hands - Front Only',
    desc: 'Enjoy beautiful henna patterns on your hands with neat stencil designs.',
    price: 59,
    oldPrice: 79,
    image: img('attribute-contents/1773144882handshenna(frontonly,uptowrist)usingstencil.webp'),
  },
  {
    key: 'he-hands-forearm',
    category: 'henna',
    name: 'Hands (Front + back till half forearm)',
    desc: 'Beautiful henna applied to both hands with perfect stencil patterns.',
    price: 89,
    oldPrice: 99,
    image: img('attribute-contents/1773145406hands(front&back,uptohalfforearm)usingstencil.webp'),
  },
  {
    key: 'he-feet',
    category: 'henna',
    name: 'Feet (From toes up to ankles)',
    desc: 'Get elegant henna designs with neat & festive patterns with precision.',
    price: 59,
    oldPrice: 79,
    image: img(
      'attribute-contents/1773146057servicethumbnails_foothenna(fromtoeuptoankles)usingstencil.webp',
    ),
  },
  // Massage
  {
    key: 'ms-foot',
    category: 'massage',
    name: 'Foot Massage (20–30 Minutes)',
    desc: 'A relaxing foot massage to ease tension & soothe tired feet.',
    price: 39,
    options: 2,
    image: img('attribute-groups/1772791959attributesgrouping_headmassage.webp'),
  },
  {
    key: 'ms-head',
    category: 'massage',
    name: 'Head Massage (20–30 Minutes)',
    desc: 'A soothing head massage to help you unwind & reset.',
    price: 39,
    options: 2,
    image: img('attribute-groups/1772792169attributesgrouping_headmassage.webp'),
  },
  {
    key: 'ms-palm',
    category: 'massage',
    name: 'Palm Massage',
    desc: 'Palm massage to help you de-stress, reduce tension & increase joint mobility.',
    price: 30,
    oldPrice: 45,
    image: img('attribute-contents/177082948915min.webp'),
  },
  {
    key: 'ms-oil',
    category: 'massage',
    name: 'Oil Massage (Head & Scalp)',
    desc: 'Relaxing head & scalp massage with oil to ease tension & nourish scalp.',
    price: 39,
    oldPrice: 49,
    image: img('attribute-contents/1775554891servicethumbnails_bundle60min.webp'),
  },
  // Combos
  {
    key: 'cb-classic',
    category: 'combos',
    name: 'Classic Mani-Pedi Combo',
    desc: 'Bestselling Classic Mani-Pedi Combo with Essie & Kinetics shades.',
    price: 109,
    oldPrice: 180,
    image: img(
      'attribute-contents/1776240550servicethumbnails_bestsellers_classicmani-pedicombo.jpeg',
    ),
  },
  {
    key: 'cb-foot',
    category: 'combos',
    name: 'Classic Mani-Pedi & Foot Massage',
    desc: 'Mani-Pedi for perfect nails & a soothing foot massage to unwind.',
    price: 149,
    oldPrice: 240,
    image: img('attribute-contents/1759392360classicmani-pedi&footmassagecombo(1).jpg'),
  },
  {
    key: 'cb-gel',
    category: 'combos',
    name: 'Gel Polish Mani-Pedi Combo',
    desc: 'Achieve stunning, long-lasting nails with our Gel Manicure & Pedicure.',
    price: 169,
    oldPrice: 260,
    image: img('attribute-contents/17686456111759388832gelpolishmani-pedicombo.webp'),
  },
  {
    key: 'cb-massage',
    category: 'combos',
    name: 'Gel Mani-Pedi + Massage',
    desc: 'Pamper your nails & indulge in a soothing massage for complete relaxation.',
    price: 199,
    oldPrice: 330,
    image: img('attribute-contents/1759389383gelmani-pedimassage.jpg'),
  },
  {
    key: 'cb-gel-classic',
    category: 'combos',
    name: 'Gel Mani & Classic Pedi',
    desc: 'Long-lasting perfect nails with our Gel Mani & Classic Pedi combo.',
    price: 149,
    oldPrice: 210,
    image: img('attribute-contents/1759392001gelpolish&classiccombo.jpg'),
  },
  {
    key: 'cb-polish-free',
    category: 'combos',
    name: 'Polish-Free Mani-Pedi',
    desc: 'High-shine Manicure & Pedicure treatment for shiny & clean nails without polish.',
    price: 99,
    oldPrice: 180,
    image: img('attribute-contents/1774255200attributesgrouping_polishfreemanicure&pedicure.webp'),
  },
];

interface ServiceOption {
  key: string;
  name: string;
  minutes: number;
  desc: string;
  price: number;
  oldPrice?: number;
  image: string;
}

/** Sub-options per multi-option service — only where the real content is known (app screenshots).
 *  Everything else renders a GREEN missing-data placeholder in the options sheet. */
const OPTIONS: Record<string, ServiceOption[]> = {
  'nl-classic': [
    {
      key: 'classic-manicure',
      name: 'Classic Manicure',
      minutes: 40,
      desc: 'Get smooth & nourished hands with our Classic Manicure treatment.',
      price: 69,
      oldPrice: 80,
      image: img('attribute-contents/1776229757servicethumbnails_nails_classicpedicure.png'),
    },
    {
      key: 'classic-pedicure',
      name: 'Classic Pedicure',
      minutes: 50,
      desc: 'Step lighter with a refreshing Classic Pedicure glow.',
      price: 85,
      oldPrice: 100,
      image: img('attribute-contents/1776229757servicethumbnails_nails_classicpedicure.png'),
    },
    {
      key: 'classic-combo',
      name: 'Classic Mani-Pedi Combo',
      minutes: 90,
      desc: 'Bestselling Classic Mani-Pedi Combo with Essie & Kinetics shades.',
      price: 109,
      oldPrice: 180,
      image: img(
        'attribute-contents/1776237917servicethumbnails_bestsellers_classicmani-pedicombo.jpeg',
      ),
    },
  ],
};

/** "Overview" tiles inside the options sheet (app screenshot; icons are lucide stand-ins). */
const OPTIONS_OVERVIEW: { icon: string; label: string }[] = [
  { icon: 'swatch-book', label: '50 Branded Shades' },
  { icon: 'thumbs-up', label: 'Skilled Experts' },
];

/** Step-2 "People also added" add-ons (app screenshot 08). Titles marked ⚠ were truncated in the
 *  screenshot and are resolved conservatively — confirm before finalizing. Missing images are GREEN. */
const SALON_ADDONS: { title: string; price: number; oldPrice: number; image?: string }[] = [
  {
    title: 'Foot Massage (20 mins)',
    price: 49,
    oldPrice: 90,
    image: img('attribute-groups/1772791959attributesgrouping_headmassage.webp'),
  }, // ⚠ title
  {
    title: 'Head Massage (20 mins)',
    price: 49,
    oldPrice: 70,
    image: img('attribute-groups/1772792169attributesgrouping_headmassage.webp'),
  }, // ⚠ title
  {
    title: 'Palm Massage (15 mins)',
    price: 30,
    oldPrice: 45,
    image: img('attribute-contents/177082948915min.webp'),
  }, // ⚠ title
  { title: 'Under Eye Pads', price: 25, oldPrice: 35 },
  { title: 'Collagen Gloves', price: 49, oldPrice: 65 },
  { title: 'Collagen Socks', price: 49, oldPrice: 65 },
  { title: 'Collagen Gloves & Socks', price: 89, oldPrice: 105 }, // ⚠ title
];

/** Date & Time content (app screenshot 09). */
const SALON_DAYS = [
  { day: 'SAT', date: 8 },
  { day: 'SUN', date: 9 },
  { day: 'MON', date: 10 },
  { day: 'TUE', date: 11 },
  { day: 'WED', date: 12 },
  { day: 'THU', date: 13 },
  { day: 'FRI', date: 14 },
];
const SALON_SLOTS = ['07:00-07:30', '07:30-08:00', '08:00-08:30', '08:30-09:00'];

/** Salon professionals with the zones they serve; Auto-assign is always available everywhere. */
const SALON_PROS: FunnelPro[] = [
  {
    key: 'hidsa',
    name: 'Hidsa M',
    rating: '4.9',
    photo: PRO_PHOTOS.maria,
    zones: ['A'],
    subtitle: 'Recommended in your area',
  },
  {
    key: 'sara',
    name: 'Sara Calvin',
    rating: '4.9',
    photo: PRO_PHOTOS.jennefer,
    zones: ['A'],
    subtitle: 'Recommended in your area',
  },
  {
    key: 'maryam',
    name: 'Maryam A',
    rating: '4.8',
    photo: PRO_PHOTOS.rewata,
    zones: ['B'],
    subtitle: 'Recommended in your area',
  },
];

/** Tip presets on the checkout step (app screenshot 10). */
const TIP_OPTIONS: { key: string; amount?: number; emoji: string }[] = [
  { key: 'aed5', amount: 5, emoji: '\u{1F60A}' },
  { key: 'aed10', amount: 10, emoji: '\u{1F604}' },
  { key: 'aed20', amount: 20, emoji: '\u{1F60D}' },
  { key: 'other', emoji: '\u{1F60E}' },
];

// `money` + `Price` live in `funnel-money.tsx` — the combo card and its sheet render the same
// money, and a screen importing a screen is how the rebooking sheet once broke the build.

// ── step 1 pieces ───────────────────────────────────────────────────────────────────────────────

/**
 * The hero band — the service's CDN loop, on BOTH platforms (`hero-video.tsx` uses `expo-video`,
 * `hero-video.web.tsx` a `<video>` element). It used to fall back to the funnel aurora on native, which
 * left the whole top of the screen an empty pale gradient on a real device: no footage, and no caption
 * either (the "Indulge in luxury beauty services at home" line is baked into the CDN file).
 */
function HeroBand() {
  const t = useTheme();
  return <HeroVideo source={SALON_VIDEO} backgroundColor={t.background.inverse} />;
}

/** Carousel progress overlaid on the band (fades out with `bandContent` as it collapses). The
 *  "Indulge in luxury beauty services at home" caption is baked into the CDN video itself, so the
 *  overlay draws only the progress track — a UI caption would double it. */
function HeroOverlay() {
  const t = useTheme();
  return (
    // Two things crowd this track. The card overlaps the band's foot by `overlap` (size.24), so a
    // `space.lg` padding parked it exactly ON the card's rounded top edge; and the caption is baked
    // into the CDN video a few points higher, so it can't simply move up either. Clear the overlap,
    // then take the gap that's actually free between the two.
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: t.space.md,
        paddingBottom: t.size['24'] + t.size['6'],
        gap: t.space.sm,
      }}
    >
      {/* Carousel progress — first segment filled (single hero video today). */}
      <View
        style={{
          height: t.size['4'],
          borderRadius: t.radius.pill,
          backgroundColor: t.background.primary,
          opacity: 0.9,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '30%',
            height: '100%',
            borderRadius: t.radius.pill,
            backgroundColor: t.background.brandDefault,
          }}
        />
      </View>
    </View>
  );
}

/** One tile of the in-page category grid (4-col). Tap = jump the sticky tabs to that category. */
function CategoryTile({
  label,
  image,
  onPress,
}: {
  label: string;
  image: ThumbSource;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: '25%',
        paddingHorizontal: t.space.xs,
        alignItems: 'center',
        gap: t.space.xs,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          // Fills its column: wider and flatter than the old fixed 72, which floated in a 100 column.
          width: '100%',
          height: t.size['56'],
          borderRadius: t.radius.default,
          overflow: 'hidden',
          backgroundColor: t.background.tertiary,
        }}
      >
        <Image
          source={thumbSource(image)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityIgnoresInvertColors
        />
      </View>
      {/* No two-line reserve: a row sizes to its own tallest label (so "Hair Removal" still lines its
          row up), and a last row of one-line labels doesn't leave an empty line under the grid. */}
      <Text variant="bodyXSmall" align="center" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Compact sticky category tab — a pill-height chip (28px thumb + label) sized for the pinned bar,
 * replacing the full CategoryCard tiles that overflowed/clipped there. Selected = the card treatment
 * (brand outline + `background.selected` + brand label), matching the in-page grid semantics.
 */
function CategoryTabChip({
  label,
  image,
  selected,
  onPress,
  onLayoutX,
}: {
  label: string;
  image: ThumbSource;
  selected: boolean;
  onPress: () => void;
  /** Reports the chip's x/width so the bar can keep the active chip in view. */
  onLayoutX?: (x: number, width: number) => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      onLayout={(e) => onLayoutX?.(e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.xs,
        height: t.size['40'],
        // The thumb's inset must read EQUAL on all three visible sides: a 28px thumb in a 40px chip
        // leaves 6px top/bottom, so the LEFT inset is 6 too (`space.sm`/8 made it look off-centre).
        // The label keeps a roomier right inset.
        paddingLeft: t.size['6'],
        paddingRight: t.space.sm,
        borderRadius: t.radius.default,
        borderWidth: t.borderWidth.thin,
        borderColor: selected ? t.border.brandDefault : t.border.default,
        backgroundColor: selected ? t.background.selected : t.background.surface,
        opacity: pressed && !selected ? 0.7 : 1,
      })}
    >
      {/* Rounder than the page tile (`radius.md` vs `sm`) — at 28px inside a 12-radius chip the small
          radius read as a hard square; this sits near-concentric with the chip's corner. */}
      <View
        style={{
          width: t.size['28'],
          height: t.size['28'],
          borderRadius: t.radius.md,
          overflow: 'hidden',
          backgroundColor: t.background.tertiary,
        }}
      >
        <Image
          source={thumbSource(image)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text variant="labelXSmall" style={{ color: selected ? t.text.brand : t.text.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Full-bleed grey section band ("Bestsellers", "Nails", …). */
/**
 * A section heading, the way the rest of the app writes one: `titleSmall` on the page's own surface at
 * the `space.md` gutter (#54). It used to be a full-bleed grey band at `labelLarge` — which broke that
 * rule twice over: a size nothing else uses for a heading, and a fill doing work that spacing already
 * does. A tinted strip across the page reads as a table header, not as our feed (see "lean and airy,
 * not boxy"); the sections separate perfectly well on the `space.lg` between them.
 */
function SectionBand({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: t.space.md }}>
      <Text variant="titleSmall">{label}</Text>
    </View>
  );
}

/** Category benefit banner — photo left, promise bullets right (promo-subtle wash, brand checks). */
function BenefitBanner({ banner, aspect = BANNER_ASPECT }: { banner: number; aspect?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        marginHorizontal: t.space.md,
        borderRadius: t.radius.default,
        overflow: 'hidden',
        aspectRatio: aspect,
      }}
    >
      <Image
        source={banner}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

/** The GLAM65 offer strip (live web funnel content). */
function OfferBanner({ onApply }: { onApply: () => void }) {
  const t = useTheme();
  return (
    <View
      style={{
        marginHorizontal: t.space.md,
        borderRadius: t.radius.default,
        backgroundColor: t.background.promo.subtle,
        paddingHorizontal: t.space.md,
        paddingVertical: t.size['12'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
      }}
    >
      <Icon name="tag" size="md" color={t.icon.promo} />
      <View style={{ flex: 1 }}>
        <Text variant="labelXSmall" style={{ color: t.text.promoDark }}>
          Exclusive offer for you!
        </Text>
        <Text variant="labelBase" style={{ color: t.text.promoDark }}>
          65% OFF · Code: GLAM65
        </Text>
      </View>
      <Button size="xs" onPress={onApply}>
        Apply
      </Button>
    </View>
  );
}

/**
 * One service row — image (with the "N Options" tag), title, 2-line description box, price row with
 * "Starts at" / strikethrough, and the shared Add ↔ 22px stepper control. Rows are equal-height by
 * construction (fixed image + 1-line title + fixed 2-line desc + 1-line price row), per the hard rule.
 */
function ServiceRow({
  service,
  quantity,
  onAdd,
  onQuantityChange,
  onOpen,
}: {
  service: SalonService;
  quantity: number;
  onAdd: () => void;
  onQuantityChange: (qty: number) => void;
  /** Tapping the CARD (anywhere but the Add control) opens the service's detail/options sheet. */
  onOpen: () => void;
}) {
  const t = useTheme();
  const multi = (service.options ?? 0) > 1;
  const [pressed, setPressed] = useState(false);
  return (
    // White `surface` card on the recessed page (the DS elevation model — a raised content unit), and
    // the whole card opens the service. It CANNOT be a `Pressable` wrapping the Add control: that nests
    // a button inside a button (invalid DOM on web, and one a11y target swallowing another). So the
    // card's press target LIES UNDERNEATH the content, the way `BookAgainCard` and `ComboCard` do it.
    // Note `box-none` is not enough on its own — on native a plain `View` still swallows a touch, so
    // every passive branch is explicitly `none` and only the real controls stay live.
    <View
      style={{
        borderRadius: t.radius.default,
        backgroundColor: t.background.surface,
        // In the basket the card takes the brand outline — the same mark the combo cards use. Before
        // this a service in your basket looked exactly like one that wasn't, and only the stepper gave
        // it away. Default state has no visible edge (the border is painted the card's own surface),
        // so marking it shifts nothing.
        borderWidth: t.borderWidth.thin,
        borderColor: quantity > 0 ? t.border.brandDefault : t.background.surface,
        overflow: 'hidden',
        opacity: pressed ? 0.7 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={service.name}
        onPress={onOpen}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="box-none"
        style={{ flexDirection: 'row', gap: t.space.md, padding: t.size['12'] }}
      >
      <View
        pointerEvents="none"
        style={{
          width: t.size['96'],
          height: t.size['96'],
          borderRadius: t.radius.default,
          overflow: 'hidden',
          backgroundColor: t.background.tertiary,
        }}
      >
        <Image
          source={{ uri: service.image }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityIgnoresInvertColors
        />
        {multi ? (
          <View
            style={{
              position: 'absolute',
              left: t.space.xs,
              bottom: t.space.xs,
              backgroundColor: t.background.options,
              borderRadius: t.radius.sm,
              paddingHorizontal: t.space.sm,
              paddingVertical: t.size['2'],
            }}
          >
            {/* Tight lineHeight is the WEB-ONLY caps-centering fix — on iOS it renders high/clipped
                (rule #39's native caveat), so native keeps the natural line box. */}
            <Text
              variant="labelXXSmall"
              style={{
                color: t.text.onBrand,
                ...(Platform.OS === 'web'
                  ? { lineHeight: t.typography.labelXXSmall.fontSize }
                  : null),
              }}
            >
              {service.options} Options
            </Text>
          </View>
        ) : null}
      </View>

      <View pointerEvents="box-none" style={{ flex: 1, gap: t.space.xs }}>
        <View pointerEvents="none">
          <Text variant="titleSmall" numberOfLines={1}>
            {service.name}
          </Text>
        </View>
        {/* Fixed 2-line box so 1-line and 2-line descriptions leave rows equal-height. */}
        <View pointerEvents="none" style={{ minHeight: t.size['28'], justifyContent: 'flex-start' }}>
          <Text variant="bodyXSmall" color="secondary" numberOfLines={2}>
            {service.minutes ? `${service.minutes} min • ${service.desc}` : service.desc}
          </Text>
        </View>
        <HStack
          justify="space-between"
          align="center"
          pointerEvents="box-none"
          style={{ marginTop: 'auto' }}
        >
          <HStack gap="xs" align="center" pointerEvents="none">
            {multi ? (
              <Text variant="bodyXSmall" color="secondary">
                Starts at
              </Text>
            ) : null}
            <Price amount={service.price} variant="labelBase" />
            {!multi && service.oldPrice ? (
              <Price amount={service.oldPrice} variant="bodyXSmall" color="tertiary" strike />
            ) : null}
          </HStack>
          {quantity <= 0 ? (
            <Button size="2xs" onPress={onAdd}>
              Add
            </Button>
          ) : (
            <QuantityStepper size="sm" value={quantity} min={0} onChange={onQuantityChange} />
          )}
        </HStack>
      </View>
      </View>
    </View>
  );
}

/**
 * **Options sheet** — what a service card opens: the same detail card, once for a single-option service
 * and once per option for a multi-option one.
 *
 * The sheet holds a DRAFT, exactly like the combo sheet: the steppers inside it edit what you're about
 * to book, and the footer's price ladder + "Add to cart" is what writes it to the basket. Before this
 * the rows wrote straight through and the sheet had no footer at all, so two sheets opened from two
 * cards in the same list ended differently. Services whose real option data we don't have yet still get
 * the honest GREEN placeholder.
 */
function OptionsSheet({
  service,
  cart,
  onChangeLine,
  onClose,
}: {
  service: SalonService | null;
  cart: Record<string, number>;
  onChangeLine: (lineKey: string, name: string, price: number, qty: number) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const options = service ? OPTIONS[service.key] : undefined;

  /**
   * Every line this sheet can write, so the draft can be seeded from (and diffed against) the basket.
   *
   * A multi-option service whose real list we haven't captured yet still gets **one card per option** —
   * the card count is the one thing the catalogue already tells us ("2 Options"), so the sheet works and
   * can be reviewed. Those cards are marked GREEN: a placeholder that looks like content is worse than
   * no content, because nobody remembers to replace it.
   */
  const lines = useMemo(() => {
    type Line = { key: string; name: string; price: number; oldPrice?: number; placeholder?: boolean };
    if (!service) return [] as Line[];
    if (options)
      return options.map((o) => ({
        key: `${service.key}:${o.key}`,
        name: o.name,
        price: o.price,
        oldPrice: o.oldPrice,
      })) as Line[];
    const count = service.options ?? 0;
    if (count > 1)
      return Array.from({ length: count }, (_, i) => ({
        key: `${service.key}:option-${i + 1}`,
        name: `Option ${i + 1}`,
        price: service.price,
        placeholder: true,
      })) as Line[];
    return [
      { key: service.key, name: service.name, price: service.price, oldPrice: service.oldPrice },
    ] as Line[];
  }, [service, options]);

  const seed = () => {
    const next: Record<string, number> = {};
    for (const l of lines) if (cart[l.key]) next[l.key] = cart[l.key]!;
    return next;
  };
  const [draft, setDraft] = useState<Record<string, number>>({});
  // Re-seed on each open — a draft you closed without adding is not a decision (same as the combo sheet).
  const openedKey = service?.key ?? '';
  const [seeded, setSeeded] = useState('');
  if (openedKey !== seeded) {
    setSeeded(openedKey);
    if (openedKey) setDraft(seed());
  }

  const setQty = (key: string, qty: number) =>
    setDraft((cur) => {
      const next = { ...cur };
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });

  const total = lines.reduce((sum, l) => sum + l.price * (draft[l.key] ?? 0), 0);
  const oldTotal = lines.reduce((sum, l) => sum + (l.oldPrice ?? l.price) * (draft[l.key] ?? 0), 0);
  const chosen = Object.values(draft).reduce((a, b) => a + b, 0);

  /** The single-option shortcut: nothing to choose between, so the footer books the one line itself. */
  const addOnly = () => {
    const only = lines[0];
    if (!only) return;
    onChangeLine(only.key, only.name, only.price, 1);
    onClose();
  };

  /** Commit the draft: every line this sheet owns is written, so clearing one removes it too. */
  const apply = () => {
    for (const l of lines) onChangeLine(l.key, l.name, l.price, draft[l.key] ?? 0);
    onClose();
  };

  /** One option (or the service itself) as the sheet's detail card. */
  const detailCard = (
    o: { key: string; name: string; price: number; oldPrice?: number; placeholder?: boolean },
    image: string,
    meta: string,
  ) => (
    <View
      key={o.key}
      style={{
        backgroundColor: t.background.secondary,
        borderRadius: t.radius.default,
        // No selected outline in here: inside a sheet the stepper on the row already says what you
        // picked, and a second marker on a list of two or three cards is noise.
        padding: t.size['12'],
        flexDirection: 'row',
        gap: t.space.md,
      }}
    >
      <View
        style={{
          width: t.size['72'],
          height: t.size['72'],
          borderRadius: t.radius.default,
          overflow: 'hidden',
          backgroundColor: t.background.tertiary,
        }}
      >
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={{ flex: 1, gap: t.space.xs }}>
        <HStack gap="sm" align="center">
          <Text variant="labelBase" numberOfLines={1}>
            {o.name}
          </Text>
          {o.placeholder ? (
            <View
              style={{
                backgroundColor: '#22C55E',
                borderRadius: t.radius.sm,
                paddingHorizontal: t.space.sm,
                paddingVertical: t.size['2'],
              }}
            >
              <Text variant="labelXXSmall" style={{ color: '#FFFFFF' }}>
                Placeholder
              </Text>
            </View>
          ) : null}
        </HStack>
        <Text variant="bodyXSmall" color="secondary" numberOfLines={2}>
          {meta}
        </Text>
        <HStack justify="space-between" align="center">
          <HStack align="center" gap="xs">
            <Price amount={o.price} variant="labelBase" />
            {o.oldPrice ? (
              <Price amount={o.oldPrice} variant="bodyXSmall" color="tertiary" strike />
            ) : null}
          </HStack>
          {/* On a sheet with ONE card there is nothing to choose between, so the card's Add would be a
              second button saying what the footer already says. The stepper still appears once it's in,
              because changing how many is a different job from adding it. */}
          {(draft[o.key] ?? 0) > 0 ? (
            <QuantityStepper
              size="sm"
              value={draft[o.key] ?? 0}
              min={0}
              onChange={(q) => setQty(o.key, q)}
            />
          ) : lines.length > 1 ? (
            <Button size="2xs" onPress={() => setQty(o.key, 1)}>
              Add
            </Button>
          ) : null}
        </HStack>
      </View>
    </View>
  );

  return (
    <BottomSheet
      open={!!service}
      title={service?.name ?? ''}
      onClose={onClose}
      // The same ending every sheet in this funnel has: the price ladder for what you picked, then the
      // action that books it (#63 — brand, because it keeps you on this step).
      footerDivider
      // A resize is a different SERVICE arriving, not a stepper going up.
      resizeKey={service?.key ?? ''}
      footer={
        <SheetPriceFooter
          active={chosen > 0}
          price={total}
          oldPrice={oldTotal}
          // A single-option sheet can always act — there is only one thing to add — so its full-width
          // button is live; a multi-option sheet has to be told which one first.
          disabled={chosen === 0 && lines.length !== 1}
          onPress={chosen > 0 ? apply : addOnly}
        />
      }
    >
      {service ? (
        <VStack gap="sm">
          {lines.map((l) =>
            detailCard(
              l,
              options
                ? (options.find((o) => `${service.key}:${o.key}` === l.key)?.image ?? service.image)
                : service.image,
              l.placeholder
                ? 'Real name, duration and price still to come.'
                : options
                  ? (() => {
                      const o = options.find((x) => `${service.key}:${x.key}` === l.key);
                      return o ? `${o.minutes} min • ${o.desc}` : service.desc;
                    })()
                  : service.minutes
                    ? `${service.minutes} min • ${service.desc}`
                    : service.desc,
            ),
          )}
        </VStack>
      ) : null}

      <VStack gap="sm" style={{ marginTop: t.space.md }}>
        <Text variant="labelMedium">Overview</Text>
        <HStack gap="sm">
          {OPTIONS_OVERVIEW.map((o) => (
            <VStack
              key={o.label}
              gap="sm"
              align="center"
              style={{
                flex: 1,
                backgroundColor: t.background.secondary,
                borderRadius: t.radius.default,
                paddingVertical: t.space.md,
                paddingHorizontal: t.space.sm,
              }}
            >
              <Icon name={o.icon} size="md" color={t.icon.primary} />
              <Text variant="bodyXSmall" align="center">
                {o.label}
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </BottomSheet>
  );
}

// ── cart model ──────────────────────────────────────────────────────────────────────────────────

interface CartLine {
  name: string;
  price: number;
}

/** Line metadata by lineKey (quantities live in the `cart` record). */
const LINE_META: Record<string, CartLine> = {};

const lineFor = (service: SalonService): string => service.key;

/** A pack is ONE basket line whatever it contains — the summary shows the pack, not its parts. */
const comboLine = (combo: SalonCombo): string => `combo:${combo.key}`;

/** Card-level quantity: its own line + any option lines under it. */
const serviceQty = (cart: Record<string, number>, service: SalonService) =>
  Object.entries(cart).reduce(
    (sum, [k, q]) => (k === service.key || k.startsWith(`${service.key}:`) ? sum + q : sum),
    0,
  );

// ── the salon step compositions ─────────────────────────────────────────────────────────────────

function SalonServicesStep({
  cart,
  onChangeLine,
  onOpenOptions,
  onApplyOffer,
  comboSelections,
  onOpenCombo,
  onComboQuantity,
  onGridEnd,
  onSectionTop,
  onJumpTo,
}: {
  cart: Record<string, number>;
  onChangeLine: (lineKey: string, name: string, price: number, qty: number) => void;
  onOpenOptions: (service: SalonService) => void;
  onApplyOffer: () => void;
  /** What each pack currently contains — its preset until the customer edits it. */
  comboSelections: Record<string, string[]>;
  onOpenCombo: (combo: SalonCombo) => void;
  onComboQuantity: (combo: SalonCombo, qty: number) => void;
  /** Y (in content coords) where the in-page category grid ends — drives the collapse threshold. */
  onGridEnd: (y: number) => void;
  /** Y (in content coords) of each category section — drives the sticky tabs' active state. */
  onSectionTop: (key: CategoryKey, y: number) => void;
  /** Scroll the page to a category section (the page tiles and the sticky chips share this). */
  onJumpTo: (key: CategoryKey) => void;
}) {
  const t = useTheme();
  return (
    <VStack gap="lg" style={{ paddingBottom: t.space.lg }}>
      {/* Hero title block — title and its two proofs: how fast it arrives, and how many people have
          booked it. The ETA sits under the title where it reads as a promise about THIS service; the
          rating stacks into its own card on the right so the number and its volume stay together.
          Nothing follows the title into the collapsed header: by the time the header carries the title
          this block has scrolled away, and the bar is chrome over a video — no room for proof. */}
      <HStack gap="sm" align="stretch" justify="space-between" style={{ paddingHorizontal: t.space.md }}>
        <VStack gap="xs" style={{ flexShrink: 1 }}>
          <Text variant="titleLarge">Women's Salon</Text>
          <Badge tone="instant" icon="instant-bolt" size="md">
            At your door in 30 mins
          </Badge>
        </VStack>
        {/* `align="stretch"` on the row is what squares the card off against the title block — it takes
            its height from the two things beside it rather than a number that would drift the moment
            either changed. The rating band runs the card's full width so the two halves read as one
            card, and the count sits under it on its own two lines. */}
        <View
          style={{
            borderRadius: t.radius.default,
            borderWidth: t.borderWidth.hairline,
            borderColor: t.border.default,
            overflow: 'hidden',
          }}
        >
          <HStack
            gap="xs"
            align="center"
            justify="center"
            style={{
              paddingHorizontal: t.space.sm,
              paddingVertical: t.size['2'],
              backgroundColor: t.badge.bg.instant,
            }}
          >
            <Icon name="star" size="xs" color={t.badge.text.instantIcon} fill={t.badge.text.instantIcon} />
            <Text variant="labelXXSmall" style={{ color: t.badge.text.instant }}>
              4.9
            </Text>
          </HStack>
          <VStack
            align="center"
            justify="center"
            style={{ flex: 1, paddingHorizontal: t.space.sm, paddingVertical: t.space.xs }}
          >
            <Text variant="bodyXSmall" color="secondary" align="center">
              363K
            </Text>
            <Text variant="bodyXSmall" color="secondary" align="center">
              bookings
            </Text>
          </VStack>
        </View>
      </HStack>

      <OfferBanner onApply={onApplyOffer} />

      {/* Category grid — 4-col image tiles. These ARE the sticky tabs: the shell collapses exactly
          when this grid's last row clears the header, so the tiles hand over to the compact chips
          instead of both being on screen at once. */}
      <View
        onLayout={(e) => onGridEnd(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: t.space.sm,
          // The gutter lives INSIDE each column (`space.xs` a side, so tiles sit `space.sm` apart like
          // every other row in the app); the grid gives back that half so the first tile still starts
          // on the page's `space.md` margin. A fixed tile width in a 25% column left 28 between them.
          paddingHorizontal: t.space.md - t.space.xs,
        }}
      >
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.key}
            label={c.label}
            image={c.image}
            onPress={() => onJumpTo(c.key)}
          />
        ))}
      </View>

      {/* One section per category: heading + (where real) the benefit banner + service rows. The combo
          section is the exception — its rows are packs you assemble, not services you add. */}
      {CATEGORIES.map((c) => {
        const items = SERVICES.filter((s) => s.category === c.key);
        const banner = BANNERS[c.key];
        const combos = c.key === 'make-your-own-combo' ? COMBOS : [];
        return (
          <VStack
            key={c.key}
            gap="md"
            onLayout={(e) => onSectionTop(c.key, e.nativeEvent.layout.y)}
          >
            <SectionBand label={c.label} />
            {banner ? <BenefitBanner banner={banner} aspect={BANNER_ASPECTS[c.key]} /> : null}
            {combos.length ? (
              <VStack gap="sm" style={{ paddingHorizontal: t.space.md }}>
                {combos.map((combo) => (
                  <ComboCard
                    key={combo.key}
                    combo={combo}
                    selection={comboSelections[combo.key] ?? combo.preset}
                    quantity={cart[comboLine(combo)] ?? 0}
                    onOpen={() => onOpenCombo(combo)}
                    onQuantityChange={(q) => onComboQuantity(combo, q)}
                  />
                ))}
              </VStack>
            ) : null}
            {/* Rendered only when the section HAS services — an empty stack still costs the parent's
                `md` gap, which read as a stray hole under the combo section. */}
            {items.length ? (
            <VStack gap="sm" style={{ paddingHorizontal: t.space.md }}>
              {items.map((s) => (
                <ServiceRow
                  key={s.key}
                  service={s}
                  quantity={serviceQty(cart, s)}
                  onOpen={() => onOpenOptions(s)}
                  onAdd={() => {
                    if ((s.options ?? 0) > 1) onOpenOptions(s);
                    else onChangeLine(lineFor(s), s.name, s.price, 1);
                  }}
                  onQuantityChange={(q) => {
                    if ((s.options ?? 0) > 1) onOpenOptions(s);
                    else onChangeLine(lineFor(s), s.name, s.price, q);
                  }}
                />
              ))}
            </VStack>
            ) : null}
          </VStack>
        );
      })}
    </VStack>
  );
}

function SalonAddOnsStep() {
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
        {SALON_ADDONS.map((a) => (
          <View key={a.title} style={{ width: '48%' }}>
            <AddOnsCard
              title={a.title}
              price={a.price}
              oldPrice={a.oldPrice}
              currency="AED"
              image={
                a.image ? (
                  <Image
                    source={{ uri: a.image }}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  // No real asset captured for this add-on yet — the honest green placeholder.
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#22C55E',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="labelXXSmall" style={{ color: '#FFFFFF' }}>
                      Missing image
                    </Text>
                  </View>
                )
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

function SalonDateTimeStep({
  pro,
  onPro,
  zone,
  onPolicyDetails,
  onAllSlots,
}: {
  /** Selected professional key — lifted to the flow so the checkout address change can revalidate it. */
  pro: string;
  onPro: (key: string) => void;
  /** The current address's zone — named pros are filtered to it. */
  zone: 'A' | 'B';
  onPolicyDetails: () => void;
  onAllSlots: () => void;
}) {
  const t = useTheme();
  const [date, setDate] = useState(9);
  const [slot, setSlot] = useState(SALON_SLOTS[0]);
  return (
    <VStack gap="lg" style={{ paddingBottom: t.space.lg }}>
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
          {SALON_PROS.filter((p) => p.zones.includes(zone)).map((p) => (
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
        <DatePicker days={SALON_DAYS} value={date} onChange={(d) => setDate(Number(d))} />
      </Question>

      {/* Title row carries the "See all" slot-sheet link, so it's composed instead of `Question`. */}
      <VStack gap="sm">
        <HStack justify="space-between" align="center" style={{ paddingHorizontal: t.space.md }}>
          <Text variant="labelMedium">What time would you like us to start?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all time slots"
            onPress={onAllSlots}
            hitSlop={t.space.sm}
          >
            <Text variant="labelXSmall" color="link">
              See all
            </Text>
          </Pressable>
        </HStack>
        <TimeSlotPicker slots={SALON_SLOTS} value={slot} onChange={setSlot} />
      </VStack>

      <View style={{ paddingHorizontal: t.space.md }}>
        <Disclaimer action={{ label: 'Details', onPress: onPolicyDetails }}>
          Enjoy free cancellation up to 6 hours before your booking start time.
        </Disclaimer>
      </View>
    </VStack>
  );
}

/** "Show some love to your Professional" — tip presets on the accent surface. Chips reuse the DS
 *  selected-chip language (brand fill + onBrand label, `radius.control`) with the Dirham symbol. */
function TipCard({ tip, onTip }: { tip: string | null; onTip: (key: string | null) => void }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.background.selected,
        borderRadius: t.radius.default,
        padding: t.space.md,
        gap: t.space.md,
      }}
    >
      <HStack gap="sm" align="center">
        <View
          style={{
            width: t.size['40'],
            height: t.size['40'],
            borderRadius: t.radius.pill,
            backgroundColor: t.background.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="user" size="md" color={t.icon.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="labelMedium">Show some love to your Professional</Text>
          <Text variant="bodyXSmall" color="secondary">
            100% of your tip goes directly to your professional
          </Text>
        </View>
      </HStack>
      <HStack gap="sm">
        {TIP_OPTIONS.map((o) => {
          const selected = tip === o.key;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={o.amount ? `Tip AED ${o.amount}` : 'Other tip amount'}
              onPress={() => onTip(selected ? null : o.key)}
              style={{
                flex: 1,
                height: t.size['40'],
                borderRadius: t.radius.control,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: t.space.xs,
                backgroundColor: selected ? t.background.brandDefault : t.background.primary,
              }}
            >
              {o.amount ? (
                <>
                  <Dirham variant="labelXSmall" color={selected ? 'onBrand' : 'primary'} />
                  <Text variant="labelXSmall" color={selected ? 'onBrand' : 'primary'}>
                    {o.amount}
                  </Text>
                </>
              ) : (
                <Text variant="labelXSmall" color={selected ? 'onBrand' : 'primary'}>
                  Other
                </Text>
              )}
              <Text variant="labelXSmall">{o.emoji}</Text>
            </Pressable>
          );
        })}
      </HStack>
    </View>
  );
}

function SalonCheckoutStep({
  address,
  onChangeAddress,
  onChangePayment,
  voucher,
  onAddVoucher,
  onRemoveVoucher,
  walletApplied,
  onToggleWallet,
  tip,
  onTip,
  summaryRows,
  total,
}: {
  /** The address this booking will be served at (current selection). */
  address: (typeof ADDRESSES)[number];
  onChangeAddress: () => void;
  onChangePayment: () => void;
  voucher: string;
  onAddVoucher: () => void;
  onRemoveVoucher: () => void;
  walletApplied: boolean;
  onToggleWallet: () => void;
  tip: string | null;
  onTip: (key: string | null) => void;
  summaryRows: PriceDetailsRow[];
  total: number;
}) {
  const t = useTheme();
  return (
    <VStack gap="lg" style={{ paddingHorizontal: t.space.md, paddingBottom: t.space.md }}>
      {/* Service address — the shared checkout block (AGENTS #46/#47). */}
      <AddressSection address={address} onChange={onChangeAddress} />

      <Card
        bordered
        padded={false}
        elevation="none"
        style={{ paddingVertical: t.size['12'], paddingHorizontal: t.size['12'] }}
      >
        <HStack gap="sm" align="center">
          <MissingLogo label="tabby" />
          <Text variant="bodyXSmall" color="secondary" style={{ flex: 1 }}>
            4 interest-free instalments-no extra fees.
          </Text>
          <Icon name="info" size="sm" color={t.icon.secondary} />
        </HStack>
      </Card>

      <VStack gap="sm">
        <HStack gap="xs" align="center">
          <Text variant="labelMedium">Payment Method</Text>
          <Icon name="info" size="sm" color={t.icon.secondary} />
        </HStack>
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

      <TipCard tip={tip} onTip={onTip} />

      <VStack gap="sm">
        <Text variant="labelMedium">Apply Voucher or Wallet Balance</Text>
        <HStack gap="sm" align="stretch">
          <MiniActionCard
            label="Voucher Code"
            action="Add"
            onPress={onAddVoucher}
            value={voucher || undefined}
            onRemove={onRemoveVoucher}
            removeLabel="Remove voucher"
          />
          {walletApplied ? (
            <MiniActionCard
              label="Wallet · Applied"
              action="Details"
              value="AED 40.00"
              onPress={() => {}}
              onRemove={onToggleWallet}
              removeLabel="Remove wallet balance"
            />
          ) : (
            <MiniActionCard label="Wallet Balance" action="Apply" onPress={onToggleWallet} />
          )}
        </HStack>
      </VStack>

      <PriceDetails
        title="Payment Summary"
        rows={summaryRows}
        total={{ label: 'Total (inc. VAT)', value: `AED ${total.toFixed(2)}` }}
      />
    </VStack>
  );
}

// ── the navigable flow ──────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

interface SalonStepConfig {
  title: string;
  cta: string;
  firstItem: 'card' | 'text';
}

const STEP_CONFIG: Record<number, SalonStepConfig> = {
  1: { title: "Women's Salon", cta: 'Next', firstItem: 'text' },
  2: { title: 'Popular Add-ons', cta: 'Next', firstItem: 'text' },
  3: { title: 'Date & Time', cta: 'Next', firstItem: 'card' },
  4: { title: 'Checkout', cta: 'Complete', firstItem: 'card' },
};

/** Amazon-card promo rate on the live funnel (263.00 → −26.30). */
const CARD_DISCOUNT_RATE = 0.1;
const WALLET_BALANCE = 40;
/** Difference between the step-1 subtotal ladder and the checkout total on the live funnel. */
const SERVICE_FEE = 13.15;

/**
 * The Women's Salon flex funnel. Frame-agnostic like the home-cleaning screen: the host supplies
 * safe-area insets + `onExit`/`onComplete`.
 */
export function WomensSalonFunnelScreen({
  safeAreaTop,
  safeAreaBottom,
  onExit,
  onComplete,
  initialStep = 1,
}: {
  safeAreaTop: number;
  safeAreaBottom: number;
  onExit: () => void;
  onComplete: () => void;
  initialStep?: number;
}) {
  const t = useTheme();
  const [step, setStep] = useState(initialStep);
  const [cart, setCart] = useState<Record<string, number>>(
    initialStep > 1
      ? {
          'nl-classic:classic-manicure': 1,
          'nl-classic:classic-pedicure': 1,
          'nl-classic:classic-combo': 1,
        }
      : {},
  );
  const [optionsFor, setOptionsFor] = useState<SalonService | null>(null);
  // A pack's contents live beside the basket: the card shows them whether or not it's been added, and
  // taking it out again puts the pack back to what it ships with.
  const [comboFor, setComboFor] = useState<SalonCombo | null>(null);
  const [comboSelections, setComboSelections] = useState<Record<string, string[]>>({});
  const [liked, setLiked] = useState(false);
  const [paymentSheet, setPaymentSheet] = useState(false);
  const [voucherSheet, setVoucherSheet] = useState(false);
  const [voucher, setVoucher] = useState('');
  const [policySheet, setPolicySheet] = useState(false);
  const [walletApplied, setWalletApplied] = useState(true);
  const [tip, setTip] = useState<string | null>(null);
  // Address + professional live at flow level: the checkout address change can revalidate the pro.
  const [address, setAddress] = useState('home');
  const [addressSheet, setAddressSheet] = useState(false);
  const [pro, setPro] = useState('auto');
  const currentAddress = ADDRESSES.find((a) => a.key === address) ?? ADDRESSES[0];

  // Seed line metadata for the demo cart (steps opened directly at 2+).
  LINE_META['nl-classic:classic-manicure'] = { name: 'Classic Manicure', price: 69 };
  LINE_META['nl-classic:classic-pedicure'] = { name: 'Classic Pedicure', price: 85 };
  LINE_META['nl-classic:classic-combo'] = { name: 'Classic Mani-Pedi Combo', price: 109 };

  /** Which basket line has its delete action revealed — one at a time. */
  const [openLine, setOpenLine] = useState<string | null>(null);

  const changeLine = (lineKey: string, name: string, price: number, qty: number) => {
    LINE_META[lineKey] = { name, price };
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[lineKey];
      else next[lineKey] = qty;
      return next;
    });
  };

  /** What a pack costs today, at whatever it currently contains. */
  const comboPrice = (combo: SalonCombo) =>
    comboPricing(combo, comboSelections[combo.key] ?? combo.preset).price;

  /** Add / change the quantity of a pack. Removing it forgets the edit, so the card reads as the pack
   *  the shop offers again rather than a private draft nobody can see. */
  const changeCombo = (combo: SalonCombo, qty: number) => {
    changeLine(comboLine(combo), combo.name, comboPrice(combo), qty);
    if (qty <= 0) setComboSelections((cur) => ({ ...cur, [combo.key]: combo.preset }));
  };

  /** "Add To Cart" from the sheet — keep the edit, then put (or re-price) the pack in the basket. */
  const applyCombo = (combo: SalonCombo, keys: string[]) => {
    setComboSelections((cur) => ({ ...cur, [combo.key]: keys }));
    const qty = Math.max(1, cart[comboLine(combo)] ?? 0);
    changeLine(comboLine(combo), combo.name, comboPricing(combo, keys).price, qty);
    setComboFor(null);
  };

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([key, qty]) => ({ key, qty, ...LINE_META[key] })),
    [cart],
  );
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = subtotal * CARD_DISCOUNT_RATE;
  const wallet = walletApplied ? Math.min(WALLET_BALANCE, subtotal - discount) : 0;
  const atCheckout = step === TOTAL_STEPS;
  const fee = atCheckout ? SERVICE_FEE : 0;
  const total = Math.max(0, subtotal + fee - discount - wallet);
  // The strikethrough is what you'd pay WITHOUT the promotions (subtotal + fee), matching the live
  // funnel's ladder (263.00 → 196.70; checkout 276.15 → 209.85) — not the catalog old prices.
  const oldTotal = subtotal + fee;
  const hasCart = lines.length > 0;

  const cfg = STEP_CONFIG[step];
  const back = () => (step > 1 ? setStep((s) => s - 1) : onExit());
  const next = () => (step >= TOTAL_STEPS ? onComplete() : setStep((s) => s + 1));

  const summaryRows: PriceDetailsRow[] = [
    { label: 'Subtotal', value: `AED ${subtotal.toFixed(2)}` },
    { label: 'Amazon Card Discount', value: `−AED ${discount.toFixed(2)}`, tone: 'success' },
    ...(walletApplied
      ? [{ label: 'Wallet Balance', value: `−AED ${wallet.toFixed(2)}`, tone: 'success' as const }]
      : []),
    ...(atCheckout ? [{ label: 'Service Fee', value: `AED ${fee.toFixed(2)}`, info: true }] : []),
  ];

  /** Expanded-summary header: each booked line with its own stepper (app "Summary" sheet). */
  const summaryHeader = (
    // Roomier rows + a hairline between them — a dense stack of steppers reads as one blob otherwise.
    <VStack
      style={{
        backgroundColor: t.background.secondary,
        borderRadius: t.radius.default,
        // Clips the revealed delete action to the panel's own corners.
        overflow: 'hidden',
        // NO horizontal padding here — each row carries it, so a row can slide the full width instead
        // of being cut off at a padding edge (which read as a stray inset under the sliding text).
        paddingVertical: t.space.xs,
      }}
    >
      {lines.map((l, i) => {
        const canRemove = step === 1 || lines.length > 1;
        return (
          <React.Fragment key={l.key}>
            {i > 0 ? (
              <View
                style={{
                  height: t.borderWidth.hairline,
                  backgroundColor: t.border.default,
                  marginHorizontal: t.space.md,
                }}
              />
            ) : null}
            {/* Removing a line takes two deliberate moves — swipe the row (or press the minus once the
              quantity is already 1), THEN press the revealed delete. A trash icon in the stepper went
              on one stray tap, and re-adding a service you didn't mean to lose is pure annoyance. */}
            <SwipeToDelete
              open={openLine === l.key}
              onOpenChange={(o) => setOpenLine(o ? l.key : null)}
              onDelete={() => changeLine(l.key, l.name, l.price, 0)}
              deleteLabel={`Remove ${l.name}`}
              // Flush inside the panel: the panel already carries the rounding and the tint, so the row
              // must not become a second card with its own corners and a white fill.
              radius={0}
              rowBackground={t.background.secondary}
            >
              <HStack
                justify="space-between"
                align="center"
                gap="sm"
                style={{
                  paddingVertical: t.space.sm,
                  paddingHorizontal: t.space.md,
                  backgroundColor: t.background.secondary,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="labelBase" numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Price amount={l.price} variant="labelXSmall" />
                </View>
                {/* Past the service-picker step the LAST line is locked (removable=false): emptying the
                  basket here would strand the user on a checkout with nothing to book. Other lines and
                  all quantities stay editable. */}
                <QuantityStepper
                  size="sm"
                  value={l.qty}
                  min={1}
                  removable={canRemove}
                  onRequestRemove={canRemove ? () => setOpenLine(l.key) : undefined}
                  onChange={(q) => {
                    // Adding again is the way OUT of the delete state: the reveal asked "remove this?",
                    // and raising the quantity answers no — so the row closes and the bin goes with it.
                    // Without this the only way back was to swipe the row shut, which nobody guesses.
                    if (openLine === l.key) setOpenLine(null);
                    changeLine(l.key, l.name, l.price, q);
                  }}
                />
              </HStack>
            </SwipeToDelete>
          </React.Fragment>
        );
      })}
    </VStack>
  );

  const isHero = step === 1;
  // Hero height matched to the reference funnel (02.PNG): its content card starts at ~22% of screen
  // height — `size.120 + size.16` under the status bar lands there (was ~36%, far too tall).
  const bandHeight = isHero
    ? safeAreaTop + t.size['120'] + t.size['16']
    : safeAreaTop + t.size['80'];
  // Only reserve room for the footer when there IS one. On step 1 the bar appears once something is in
  // the basket, so an empty basket was paying 96 + the home-indicator inset for a bar that isn't there —
  // the page ended on a screenful of nothing. `space.lg` is what the content owes the screen edge.
  const footerInset = hasCart || step > 1 ? t.size['96'] + safeAreaBottom : safeAreaBottom;

  // ── Step-1 tab handover + scroll-spy ─────────────────────────────────────────────────────────
  // The in-page category grid and the sticky chips are the SAME control at two scales: the shell
  // collapses exactly when the grid's last row clears the header (so the tiles are gone by the time
  // the chips arrive), and the chips track whichever section you're reading.
  const headerH = safeAreaTop + t.size['48'];
  const contentTop = t.space.lg; // `contentInsetTop` for this text-first step
  const [gridEnd, setGridEnd] = useState(0);
  const [sectionTops, setSectionTops] = useState<Partial<Record<CategoryKey, number>>>({});
  const [activeCat, setActiveCat] = useState<CategoryKey>(CATEGORIES[0].key);
  // Content-coordinate → scroll-offset: the card starts at `bandHeight - overlap` and pads by `contentTop`.
  const toScrollY = (contentY: number) => bandHeight - t.size['24'] + contentTop + contentY;
  // The chips take over exactly when the in-page grid's last row clears the header (the header itself
  // collapses earlier, on its own default threshold, as soon as the hero band leaves).
  const stickyThreshold =
    gridEnd > 0 ? Math.max(t.size['16'], toScrollY(gridEnd) - headerH) : undefined;

  const scrollRef = useRef<ScrollView>(null);
  const tabsRef = useRef<ScrollView>(null);
  const chipX = useRef<Partial<Record<CategoryKey, { x: number; width: number }>>>({});

  /** Scroll a category's section right under the pinned chrome (header + chip bar). */
  const jumpToSection = (key: CategoryKey) => {
    const top = sectionTops[key];
    if (top === undefined) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, toScrollY(top) - headerH - t.size['56']),
      animated: true,
    });
    setActiveCat(key);
  };

  // Keep the active chip visible in the tab bar — past a few sections it would otherwise sit off-screen.
  useEffect(() => {
    const c = chipX.current[activeCat];
    if (!c) return;
    tabsRef.current?.scrollTo({ x: Math.max(0, c.x - t.space.md), animated: true });
  }, [activeCat, t.space.md]);

  const onContentScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    // A section is "current" once its band passes just under the pinned chrome (header + chip row).
    const probe = y + headerH + t.size['56'];
    let next = CATEGORIES[0].key;
    for (const c of CATEGORIES) {
      const top = sectionTops[c.key];
      if (top !== undefined && toScrollY(top) <= probe) next = c.key;
    }
    setActiveCat((prev) => (prev === next ? prev : next));
  };

  return (
    // Dragging in from the left edge means what the header's back control means: a step back, and
    // out of the funnel from the first step.
    <EdgeSwipeBack onBack={back}>
      {/* The screen paints its OWN canvas: this is the surface that slides, so anything behind it
          (the home underneath, in the app) is only uncovered as the gesture moves it. */}
      <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
        <PageShell
          key={step}
          pinned={!isHero}
          // The hero step's band is a VIDEO: it stays put and the card docks over it (Home's model),
          // rather than the whole band sliding off-screen — which reads as the header scrolling away.
          dockedCard={isHero}
          // Dock exactly where the PINNED funnel steps park their card (`bandHeight - overlap`, with
          // the same `safeAreaTop + size.80` band), so the two funnels' chrome is the same height.
          dockTop={safeAreaTop + t.size['80'] - t.size['24']}
          band={isHero ? <HeroBand /> : <ScreenAurora />}
          bandHeight={bandHeight}
          bandContent={isHero ? <HeroOverlay /> : undefined}
          contentInsetTop={cfg.firstItem === 'card' ? t.space.md : t.space.lg}
          stickyRow={
            isHero ? (
              <ScrollView
                ref={tabsRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                // Tight chip gap (`xs`) — `sm` read as too airy for a dense tab bar; vertical padding
                // seats the row inside the card's rounded top edge.
                contentContainerStyle={{
                  gap: t.space.xs,
                  paddingHorizontal: t.space.md,
                  paddingTop: t.space.sm,
                  paddingBottom: t.space.sm,
                }}
              >
                {CATEGORIES.map((c) => (
                  <CategoryTabChip
                    key={c.key}
                    label={c.label}
                    image={c.image}
                    selected={activeCat === c.key}
                    onPress={() => jumpToSection(c.key)}
                    onLayoutX={(x, width) => {
                      chipX.current[c.key] = { x, width };
                    }}
                  />
                ))}
              </ScrollView>
            ) : undefined
          }
          // What the video settles into as the card rides up. The SAME aurora the other funnel steps use —
          // the two funnels must read as one family; Home's stronger blue belongs to the front door, not
          // here. The header never becomes a white bar: it rides the band all the way.
          collapsedBand={isHero ? <ScreenAurora /> : undefined}
          headerHeight={headerH}
          scrollViewRef={scrollRef}
          stickyThreshold={isHero ? stickyThreshold : undefined}
          onScroll={isHero ? onContentScroll : undefined}
          renderHeader={(collapsed) => (
            <Header
              title={isHero && !collapsed ? '' : cfg.title}
              // Same title size as every other funnel step — a smaller one on the hero step made this
              // header read as a different, shorter bar than Home Cleaning's.
              titleVariant="titleLarge"
              aside={<StepIndicator current={step} total={TOTAL_STEPS} />}
              actions={
                isHero
                  ? [
                      { icon: 'search', accessibilityLabel: 'Search services', onPress: () => {} },
                      {
                        icon: 'heart',
                        accessibilityLabel: liked ? 'Remove from favourites' : 'Save to favourites',
                        tone: liked ? 'danger' : 'default',
                        filled: liked,
                        onPress: () => setLiked((v) => !v),
                      },
                    ]
                  : undefined
              }
              overMedia
              // Deliberately NOT `collapsed`: this bar must never become a white surface. It rides the
              // band the whole way — video, then brand blue — exactly like Home's chrome sits on its
              // gradient. `collapsed` here only swaps the title in.
              safeAreaTop={safeAreaTop}
              onBack={back}
            />
          )}
          footerInset={footerInset}
        >
          {step === 1 ? (
            <SalonServicesStep
              cart={cart}
              onChangeLine={changeLine}
              onOpenOptions={setOptionsFor}
              onApplyOffer={() => setVoucher('GLAM65')}
              comboSelections={comboSelections}
              onOpenCombo={setComboFor}
              onComboQuantity={changeCombo}
              onJumpTo={jumpToSection}
              onGridEnd={setGridEnd}
              onSectionTop={(key, y) =>
                setSectionTops((prev) => (prev[key] === y ? prev : { ...prev, [key]: y }))
              }
            />
          ) : step === 2 ? (
            <SalonAddOnsStep />
          ) : step === 3 ? (
            <SalonDateTimeStep
              pro={pro}
              onPro={setPro}
              zone={currentAddress.zone ?? 'A'}
              onPolicyDetails={() => setPolicySheet(true)}
              onAllSlots={() => {}}
            />
          ) : (
            <SalonCheckoutStep
              address={currentAddress}
              onChangeAddress={() => setAddressSheet(true)}
              onChangePayment={() => setPaymentSheet(true)}
              voucher={voucher}
              onAddVoucher={() => setVoucherSheet(true)}
              onRemoveVoucher={() => setVoucher('')}
              walletApplied={walletApplied}
              onToggleWallet={() => setWalletApplied((v) => !v)}
              tip={tip}
              onTip={setTip}
              summaryRows={summaryRows}
              total={total}
            />
          )}
        </PageShell>

        {/* Persistent footer OUTSIDE the per-step keyed shell (morphs across steps, like home cleaning).
          On step 1 it only appears once something is in the basket. */}
        {hasCart || step > 1 ? (
          <View
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: t.zIndex.sticky }}
            pointerEvents="box-none"
          >
            <CheckoutBar
              priced
              total={`AED ${total.toFixed(2)}`}
              oldTotal={oldTotal > total ? `AED ${oldTotal.toFixed(2)}` : undefined}
              cta={cfg.cta}
              onCtaPress={next}
              ctaDisabled={!hasCart}
              safeAreaBottom={safeAreaBottom}
              summary={{
                header: summaryHeader,
                rows: summaryRows,
                total: { label: 'Total (inc. VAT)', value: `AED ${total.toFixed(2)}` },
              }}
            />
          </View>
        ) : null}

        {/* Sheets stay mounted so every close path animates. */}
        <AddressSheet
          open={addressSheet}
          current={address}
          pro={pro}
          pros={SALON_PROS}
          serviceName="Women's Salon"
          onApply={(addressKey, newProKey) => {
            setAddress(addressKey);
            if (newProKey) setPro(newProKey);
            setAddressSheet(false);
          }}
          onClose={() => setAddressSheet(false)}
        />
        <ComboSheet
          combo={comboFor}
          selection={comboFor ? (comboSelections[comboFor.key] ?? comboFor.preset) : []}
          onApply={(keys) => comboFor && applyCombo(comboFor, keys)}
          onClose={() => setComboFor(null)}
        />
        <OptionsSheet
          service={optionsFor}
          cart={cart}
          onChangeLine={changeLine}
          onClose={() => setOptionsFor(null)}
        />
        <ChangePaymentSheet open={paymentSheet} onClose={() => setPaymentSheet(false)} />
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
