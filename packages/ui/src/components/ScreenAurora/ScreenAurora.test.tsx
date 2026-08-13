import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ScreenAurora } from './ScreenAurora';

describe('ScreenAurora', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<ScreenAurora />);
    expect(container.firstChild).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ScreenAurora />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
