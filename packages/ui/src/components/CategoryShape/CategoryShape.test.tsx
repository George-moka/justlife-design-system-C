import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CategoryShape } from './CategoryShape.web';
import { categoryShapes } from './shapes';

describe('CategoryShape', () => {
  it('renders an image for each category', () => {
    (['clean', 'heal', 'care', 'assist'] as const).forEach((category) => {
      const { container, unmount } = render(<CategoryShape category={category} label={category} />);
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('alt')).toBe(category);
      unmount();
    });
  });

  it('exports a shape string per category', () => {
    expect(Object.keys(categoryShapes).sort()).toEqual(['assist', 'care', 'clean', 'heal']);
    Object.values(categoryShapes).forEach((svg) => expect(svg).toContain('<svg'));
  });
});
