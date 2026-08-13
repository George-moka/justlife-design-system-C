import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PromiseList } from './PromiseList';

const ITEMS = [
  { title: 'More Days, More Savings!', desc: 'Save up to 40% based on your plan' },
  { title: 'Reschedule or Cancel Anytime', desc: 'Total flexibility at your fingertips!' },
];

describe('PromiseList', () => {
  it('renders each item title and description', () => {
    renderWithTheme(<PromiseList items={ITEMS} title="What you get" />);
    expect(screen.getByText('What you get')).toBeInTheDocument();
    expect(screen.getByText('More Days, More Savings!')).toBeInTheDocument();
    expect(screen.getByText('Total flexibility at your fingertips!')).toBeInTheDocument();
  });

  it('renders without a title', () => {
    renderWithTheme(<PromiseList items={ITEMS} />);
    expect(screen.getByText('Reschedule or Cancel Anytime')).toBeInTheDocument();
    expect(screen.queryByText('What you get')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<PromiseList items={ITEMS} title="What you get" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
