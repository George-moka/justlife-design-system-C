import React, { forwardRef } from 'react';
import { type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { EmptyState } from '../EmptyState/EmptyState';
import type { ButtonVariant } from '../Button/Button';

export interface ErrorStateProps extends Omit<ViewProps, 'children'> {
  /** Lucide glyph above the copy. Default `cloud-off` (most loads fail on the network). */
  icon?: string;
  /** Primary line — what went wrong. Default `"Something went wrong"`. */
  title?: React.ReactNode;
  /** Optional secondary line — what to do. Default a connection hint. */
  description?: React.ReactNode;
  /** Show a **Retry** button wired to this. */
  onRetry?: () => void;
  /** Retry button label. Default `"Retry"`. */
  retryLabel?: string;
  /** Retry button emphasis. Default `outline` — a recovery action in a calm state shouldn't shout
   *  (reserve `primary` for high-intent conversion CTAs). */
  retryVariant?: ButtonVariant;
}

/**
 * **ErrorState** — a centred failed-load state: an icon over a title + hint with a **Retry** action. Built on
 * `EmptyState` (same calm, centred layout), but it reads as *broken*, not *empty* — error-geared default copy
 * and a slightly more present icon tone (`icon.secondary` vs EmptyState's `icon.disabled`). Completes the
 * data-state trio: **loading** (`Skeleton`) → **empty** (`EmptyState`) → **error** (`ErrorState`). The consumer
 * owns vertical placement (`style={{ paddingTop }}`).
 */
export const ErrorState = forwardRef<ViewType, ErrorStateProps>(function ErrorState(
  {
    icon = 'cloud-off',
    title = 'Something went wrong',
    description = 'Please check your connection and try again.',
    onRetry,
    retryLabel = 'Retry',
    retryVariant = 'outline',
    ...rest
  },
  ref,
) {
  const t = useTheme();
  return (
    <EmptyState
      ref={ref}
      icon={icon}
      iconColor={t.icon.secondary}
      title={title}
      description={description}
      action={onRetry ? { label: retryLabel, icon: 'rotate-cw', onPress: onRetry, variant: retryVariant } : undefined}
      {...rest}
    />
  );
});
