import { describe, it, expect } from 'vitest';
import { renderWithTheme } from '../../test-utils';
import { ProfessionalAvatar } from './ProfessionalAvatar.web';

describe('ProfessionalAvatar', () => {
  it('renders the category shape and the photo layered on top', () => {
    const { container } = renderWithTheme(
      <ProfessionalAvatar category="clean" photo="/p.png" label="Leila" size={64} />,
    );
    const imgs = container.querySelectorAll('img');
    // one for the shape, one for the photo
    expect(imgs.length).toBe(2);
    const photo = Array.from(imgs).find((i) => i.getAttribute('src') === '/p.png');
    expect(photo).toBeTruthy();
    expect(photo?.getAttribute('alt')).toBe('Leila');
  });

  it('renders just the shape when no photo is given', () => {
    const { container } = renderWithTheme(<ProfessionalAvatar category="heal" label="heal" />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });
});
