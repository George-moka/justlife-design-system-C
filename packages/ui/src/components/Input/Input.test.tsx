import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Input } from './Input';

describe('Input', () => {
  it('associates the label with the field', () => {
    renderWithTheme(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('marks the field invalid when there is an error', () => {
    renderWithTheme(<Input label="Email" errorText="Required" />);
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Input label="Full name" helperText="As on your ID" />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
