import type { ServiceCategory } from './shapes';

export interface CategoryShapeProps {
  /** Service vertical — selects the coloured brand shape. */
  category: ServiceCategory;
  /** Rendered size in px (square). Default 40. */
  size?: number;
  /** Accessibility label (defaults to the category name). */
  label?: string;
}
