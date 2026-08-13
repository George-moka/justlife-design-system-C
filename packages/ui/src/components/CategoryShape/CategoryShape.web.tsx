import React from 'react';
import { categoryShapes } from './shapes';
import type { CategoryShapeProps } from './CategoryShape.types';

/** Web: renders the category shape as an inline SVG data-URI. */
export function CategoryShape({ category, size = 40, label }: CategoryShapeProps) {
  const src = `data:image/svg+xml,${encodeURIComponent(categoryShapes[category])}`;
  return (
    <img
      src={src}
      alt={label ?? category}
      width={size}
      height={size}
      draggable={false}
      style={{ display: 'block' }}
    />
  );
}
