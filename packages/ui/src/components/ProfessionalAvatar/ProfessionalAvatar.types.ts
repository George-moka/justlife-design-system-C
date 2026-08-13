import type { ServiceCategory } from '../CategoryShape';

export interface ProfessionalAvatarProps {
  /** Service vertical — selects the coloured brand shape shown behind the photo. */
  category: ServiceCategory;
  /** Professional photo URI (square, transparent cutout). Omit to show just the shape. */
  photo?: string;
  /** Square size in px. Default 56. */
  size?: number;
  /** Show a "confirmed" check overlay (bottom-right). */
  confirmed?: boolean;
  /** Accessibility label (e.g. the professional's name). */
  label?: string;
}
