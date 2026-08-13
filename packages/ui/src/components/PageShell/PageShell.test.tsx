import { describe, it, expect, vi } from 'vitest';
import { Text } from 'react-native';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PageShell } from './PageShell';
import { Header } from '../Header';

const renderHeader = (collapsed: boolean) => (
  <Header title="Home Cleaning" step={{ current: 1, total: 4 }} collapsed={collapsed} onBack={() => {}} />
);

describe('PageShell', () => {
  it('renders the header and the card content', () => {
    renderWithTheme(
      <PageShell band={null} renderHeader={renderHeader}>
        <Text>Funnel body</Text>
      </PageShell>,
    );
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Funnel body')).toBeInTheDocument();
  });

  it('starts expanded (header not collapsed → step progressbar visible)', () => {
    renderWithTheme(
      <PageShell band={null} renderHeader={renderHeader}>
        <Text>Body</Text>
      </PageShell>,
    );
    expect(screen.getByRole('progressbar', { name: 'Step 1 of 4' })).toBeInTheDocument();
  });

  it('renders an optional sticky row', () => {
    renderWithTheme(
      <PageShell
        band={null}
        renderHeader={renderHeader}
        stickyRow={<Text>Bestsellers</Text>}
      >
        <Text>Body</Text>
      </PageShell>,
    );
    expect(screen.getByText('Bestsellers')).toBeInTheDocument();
  });

  it('passes the collapsed flag to renderHeader', () => {
    const spy = vi.fn(renderHeader);
    renderWithTheme(
      <PageShell band={null} renderHeader={spy}>
        <Text>Body</Text>
      </PageShell>,
    );
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('renders header + content in pinned mode (fixed card, inner scroll)', () => {
    const spy = vi.fn(renderHeader);
    renderWithTheme(
      <PageShell pinned band={null} renderHeader={spy}>
        <Text>Pinned body</Text>
      </PageShell>,
    );
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Pinned body')).toBeInTheDocument();
    // Pinned never collapses the header.
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <PageShell band={null} renderHeader={renderHeader}>
        <Text>Body</Text>
      </PageShell>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
