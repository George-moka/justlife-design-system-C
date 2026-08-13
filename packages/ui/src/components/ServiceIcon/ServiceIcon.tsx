import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import svcBabysitting from '../../assets/services/svc_babysitting.png';
import svcAcCleaning from '../../assets/services/svc_ac_cleaning.png';
import svcCarWash from '../../assets/services/svc_car_wash.png';
import svcCleaningSubscription from '../../assets/services/svc_cleaning_subscription.png';
import svcDeepCleaning from '../../assets/services/svc_deep_cleaning.png';
import svcDisinfection from '../../assets/services/svc_disinfection.png';
import svcFluVaccine from '../../assets/services/svc_flu_vaccine.png';
import svcFurnitureCleaning from '../../assets/services/svc_furniture_cleaning.png';
import svcGeneralCleaning from '../../assets/services/svc_general_cleaning.png';
import svcGlp1 from '../../assets/services/svc_glp_1.png';
import svcHairCare from '../../assets/services/svc_hair_care.png';
import svcHandymen from '../../assets/services/svc_handymen.png';
import svcHealthcare from '../../assets/services/svc_healthcare.png';
import svcHomeInspection from '../../assets/services/svc_home_inspection.png';
import svcHomePainting from '../../assets/services/svc_home_painting.png';
import svcIvTherapy from '../../assets/services/svc_iv_therapy.png';
import svcLabTests from '../../assets/services/svc_lab_tests.png';
import svcLashesBrows from '../../assets/services/svc_lashes_brows.png';
import svcLaundry from '../../assets/services/svc_laundry.png';
import svcLifePlus from '../../assets/services/svc_life_plus.png';
import svcMensSpa from '../../assets/services/svc_mens_spa.png';
import svcNailCouture from '../../assets/services/svc_nail_couture.png';
import svcNurseCare from '../../assets/services/svc_nurse_care.png';
import svcOnlineTherapy from '../../assets/services/svc_online_therapy.png';
import svcPackersMovers from '../../assets/services/svc_packers_movers.png';
import svcPcrTests from '../../assets/services/svc_pcr_tests.png';
import svcPersonalTrainer from '../../assets/services/svc_personal_trainer.png';
import svcPestControl from '../../assets/services/svc_pest_control.png';
import svcPetGrooming from '../../assets/services/svc_pet_grooming.png';
import svcPhysiotherapy from '../../assets/services/svc_physiotherapy.png';
import svcPremiumGrooming from '../../assets/services/svc_premium_grooming.png';
import svcSalonSpa from '../../assets/services/svc_salon_spa.png';
import svcSneakerCleaning from '../../assets/services/svc_sneaker_cleaning.png';
import svcSprayTanning from '../../assets/services/svc_spray_tanning.png';
import svcWaterTankCleaning from '../../assets/services/svc_water_tank_cleaning.png';
import svcWindowCleaning from '../../assets/services/svc_window_cleaning.png';
import svcWomensSpa from '../../assets/services/svc_womens_spa.png';

/**
 * Justlife service identifiers (kebab-case). The 3D service icons are pulled from the Figma service-icon set
 * (Wallet asset page). Includes the homepage-only tiles the user exported later (AC Cleaning, Cleaning Subscription, Deep Cleaning, Life Plus).
 */
export type ServiceName =
  | 'ac-cleaning'
  | 'babysitting'
  | 'car-wash'
  | 'cleaning-subscription'
  | 'deep-cleaning'
  | 'disinfection'
  | 'flu-vaccine'
  | 'furniture-cleaning'
  | 'general-cleaning'
  | 'glp-1'
  | 'hair-care'
  | 'handymen'
  | 'healthcare'
  | 'home-inspection'
  | 'home-painting'
  | 'iv-therapy'
  | 'lab-tests'
  | 'lashes-brows'
  | 'laundry'
  | 'life-plus'
  | 'mens-spa'
  | 'nail-couture'
  | 'nurse-care'
  | 'online-therapy'
  | 'packers-movers'
  | 'pcr-tests'
  | 'personal-trainer'
  | 'pest-control'
  | 'pet-grooming'
  | 'physiotherapy'
  | 'premium-grooming'
  | 'salon-spa'
  | 'sneaker-cleaning'
  | 'spray-tanning'
  | 'water-tank-cleaning'
  | 'window-cleaning'
  | 'womens-spa';

const ICONS: Record<ServiceName, number> = {
  'ac-cleaning': svcAcCleaning,
  'babysitting': svcBabysitting,
  'car-wash': svcCarWash,
  'cleaning-subscription': svcCleaningSubscription,
  'deep-cleaning': svcDeepCleaning,
  'disinfection': svcDisinfection,
  'flu-vaccine': svcFluVaccine,
  'furniture-cleaning': svcFurnitureCleaning,
  'general-cleaning': svcGeneralCleaning,
  'glp-1': svcGlp1,
  'hair-care': svcHairCare,
  'handymen': svcHandymen,
  'healthcare': svcHealthcare,
  'home-inspection': svcHomeInspection,
  'home-painting': svcHomePainting,
  'iv-therapy': svcIvTherapy,
  'lab-tests': svcLabTests,
  'lashes-brows': svcLashesBrows,
  'laundry': svcLaundry,
  'life-plus': svcLifePlus,
  'mens-spa': svcMensSpa,
  'nail-couture': svcNailCouture,
  'nurse-care': svcNurseCare,
  'online-therapy': svcOnlineTherapy,
  'packers-movers': svcPackersMovers,
  'pcr-tests': svcPcrTests,
  'personal-trainer': svcPersonalTrainer,
  'pest-control': svcPestControl,
  'pet-grooming': svcPetGrooming,
  'physiotherapy': svcPhysiotherapy,
  'premium-grooming': svcPremiumGrooming,
  'salon-spa': svcSalonSpa,
  'sneaker-cleaning': svcSneakerCleaning,
  'spray-tanning': svcSprayTanning,
  'water-tank-cleaning': svcWaterTankCleaning,
  'window-cleaning': svcWindowCleaning,
  'womens-spa': svcWomensSpa,
};

/** Every service name, in catalog order — handy for galleries, pickers, and tests. */
export const SERVICE_NAMES = Object.keys(ICONS) as ServiceName[];

/** The icon modules behind `names` — for a screen that wants them warm before it paints. */
export const serviceIconSources = (names: ServiceName[]): number[] => names.map((n) => ICONS[n]);

export interface ServiceIconProps {
  /** Which service icon to render. */
  name: ServiceName;
  /** Square size in px. Defaults to `size.40` (40). */
  size?: number;
  /** Accessible label. Defaults to the prettified service name; pass `''` to mark it decorative. */
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * **ServiceIcon** — a 3D Justlife service icon (vacuum = General Cleaning, hair dryer = Salon & Spa, …).
 * Rendered as a square `Image` (transparent background, `contain`). Use anywhere a service needs a
 * recognizable glyph: service pickers, promo stacks, category headers.
 */
export function ServiceIcon({ name, size, accessibilityLabel, style }: ServiceIconProps) {
  const t = useTheme();
  const dim = size ?? t.size['40'];
  const label = accessibilityLabel ?? name.replace(/-/g, ' ');
  return (
    <Image
      source={ICONS[name]}
      resizeMode="contain"
      accessibilityLabel={label || undefined}
      accessibilityIgnoresInvertColors
      style={[{ width: dim, height: dim }, style]}
    />
  );
}
