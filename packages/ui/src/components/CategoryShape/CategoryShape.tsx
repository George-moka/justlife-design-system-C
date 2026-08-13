import React from 'react';
import { SvgXml } from 'react-native-svg';
import { categoryShapes } from './shapes';
import type { CategoryShapeProps } from './CategoryShape.types';

/** Native: renders the category shape via react-native-svg. */
export function CategoryShape({ category, size = 40, label }: CategoryShapeProps) {
  return <SvgXml xml={categoryShapes[category]} width={size} height={size} accessibilityLabel={label ?? category} />;
}
