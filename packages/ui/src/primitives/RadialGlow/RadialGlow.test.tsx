import { describe, it, expect } from 'vitest';
import { Text } from 'react-native';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { RadialGlow } from './RadialGlow';
import { hexToRgba } from './types';

describe('hexToRgba', () => {
  it('converts #RRGGBB with an alpha', () => {
    expect(hexToRgba('#00C3FF', 0.12)).toBe('rgba(0, 195, 255, 0.12)');
  });

  it('expands #RGB shorthand', () => {
    expect(hexToRgba('#FFF', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('returns non-hex input unchanged', () => {
    expect(hexToRgba('rgb(1, 2, 3)', 0.5)).toBe('rgb(1, 2, 3)');
  });
});

describe('RadialGlow', () => {
  it('renders its children over the glow layers', () => {
    renderWithTheme(
      <RadialGlow baseColor="#F4F4EF" glows={[{ color: '#00C3FF', x: '30%', y: '25%' }]}>
        <Text>Aurora content</Text>
      </RadialGlow>,
    );
    expect(screen.getByText('Aurora content')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <RadialGlow
        baseColor="#F4F4EF"
        glows={[
          { color: '#00C3FF', x: '30%', y: '25%', opacity: 0.12 },
          { color: '#FF7272', x: '84%', y: '95%', opacity: 0.14 },
        ]}
      >
        <Text>Content</Text>
      </RadialGlow>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
