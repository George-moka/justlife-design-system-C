import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ServiceIcon, SERVICE_NAMES } from './ServiceIcon';

describe('ServiceIcon', () => {
  it('renders an icon with a default accessible label derived from the name', () => {
    renderWithTheme(<ServiceIcon name="salon-spa" />);
    expect(screen.getByLabelText('salon spa')).toBeInTheDocument();
  });

  it('exposes the full catalog (incl. the icons used on the Wallet card)', () => {
    expect(SERVICE_NAMES.length).toBeGreaterThanOrEqual(37);
    ['general-cleaning', 'salon-spa', 'handymen'].forEach((n) => expect(SERVICE_NAMES).toContain(n));
    // The four homepage tiles exported later — the Home screen renders a GREEN placeholder without them.
    ['ac-cleaning', 'cleaning-subscription', 'deep-cleaning', 'life-plus'].forEach((n) =>
      expect(SERVICE_NAMES).toContain(n),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ServiceIcon name="car-wash" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
