import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { Tokens } from '@justlife/tokens';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

/** Status tone — maps to a tinted background / foreground token pair. */
export type StatusTone = 'success' | 'info' | 'error' | 'warning' | 'neutral';

export interface StatusBadgeProps extends Omit<ViewProps, 'children'> {
  /** Status label, e.g. "Active", "Completed", "Cancelled". */
  children: React.ReactNode;
  tone?: StatusTone;
  /** Lucide icon name. The `error` tone shows `circle-alert` by default; pass an empty string to suppress. */
  icon?: string;
}

function toneStyle(t: Tokens, tone: StatusTone): { bg: string; fg: string } {
  switch (tone) {
    case 'success':
      return { bg: t.background.successDefault, fg: t.text.success };
    case 'info':
      // Darker brand blue (#00A8DC) for contrast on the light-blue bg — the full brand
      // blue (#00C3FF text.brand) is too low-contrast on `brandSubtle`.
      return { bg: t.background.brandSubtle, fg: t.text.link };
    case 'error':
      return { bg: t.background.errorDefault, fg: t.text.error };
    case 'warning':
      return { bg: t.background.warningDefault, fg: t.text.warning };
    case 'neutral':
    default:
      return { bg: t.background.tertiary, fg: t.text.secondary };
  }
}

/**
 * Tinted status pill (e.g. a booking's "Active" / "Completed" / "Cancelled").
 * `tone` selects the tinted background + foreground; an optional leading icon is
 * shown (the `error` tone defaults to an alert). Every value is tokenised.
 *
 * Lives in a row (e.g. a card header) — the parent's vertical alignment centres it;
 * in a column, set `style={{ alignSelf: 'flex-start' }}` so it shrinks to content.
 */
export const StatusBadge = forwardRef<ViewType, StatusBadgeProps>(function StatusBadge(
  { children, tone = 'neutral', icon, style, ...rest },
  ref,
) {
  const t = useTheme();
  const { bg, fg } = toneStyle(t, tone);
  const resolvedIcon = icon === undefined ? (tone === 'error' ? 'circle-alert' : undefined) : icon || undefined;

  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.size['2'],
          paddingHorizontal: t.space.sm,
          paddingVertical: t.space.xs,
          borderRadius: t.radius.sm,
          backgroundColor: bg,
        },
        style,
      ]}
      {...rest}
    >
      {resolvedIcon ? <Icon name={resolvedIcon} size="xs" color={fg} /> : null}
      <Text variant="labelXSmall" style={{ color: fg }}>
        {children}
      </Text>
    </View>
  );
});
