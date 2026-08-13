import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';
import { hapticTap } from '../../lib/haptics';
import type { Tokens } from '@justlife/tokens';

/** Urgency of the notice — drives the tint, the text colour and the icon colour together. */
export type NotificationTone = 'danger' | 'warning' | 'neutral' | 'brand';

export interface NotificationBannerProps extends Omit<ViewProps, 'children'> {
  /** The regular-weight run — the lead-in ("Update payment to renew your"). */
  message: string;
  /** The semibold run — the part that carries the point ("Cleaning Subscription."). */
  emphasis?: string;
  /** Put the semibold run FIRST ("**Juniper will serve you tomorrow.** Home Cleaning, 08:00 - 08:30"). */
  emphasisFirst?: boolean;
  tone?: NotificationTone;
  /** Leading icon name (Lucide or a brand glyph). */
  icon?: string;
  /** Replaces the icon entirely — for a logo lockup (the Tabby chip). */
  leading?: ReactNode;
  /** Unread dot on the leading icon (a new chat message). */
  unread?: boolean;
  /** Tapping the banner resolves/opens it. Renders a chevron unless it's also dismissible. */
  onPress?: () => void;
  /** Makes the banner dismissible — renders the close button. */
  onDismiss?: () => void;
  /** Label for the close button. Default "Dismiss notification". */
  dismissLabel?: string;
  accessibilityLabel?: string;
}

interface ToneColors {
  bg: string;
  fg: string;
  icon: string;
  /** Chevron / close colour — the trailing mark is quieter than the text on the neutral tint. */
  trailing: string;
}

function toneColors(t: Tokens, tone: NotificationTone): ToneColors {
  switch (tone) {
    case 'danger':
      return { bg: t.background.error, fg: t.text.error, icon: t.icon.error, trailing: t.text.error };
    case 'warning':
      return {
        bg: t.notification.bg.warning,
        fg: t.notification.text.warning,
        icon: t.icon.info,
        trailing: t.notification.text.warning,
      };
    case 'brand':
      return {
        bg: t.background.selected,
        fg: t.text.promoDark,
        icon: t.icon.brand,
        trailing: t.icon.brand,
      };
    case 'neutral':
    default:
      return { bg: t.background.tertiary, fg: t.text.primary, icon: t.icon.brand, trailing: t.icon.secondary };
  }
}

/**
 * **Home notification banner** (Figma "Homepage Notifications") — the tinted strip that sits between the
 * hero and the feed and tells the user one thing: a payment to fix, a professional swap, tomorrow's
 * booking, a weather advisory, a new message, an offer.
 *
 * Anatomy: 24px leading icon (or a logo via `leading`) · a two-run text block where one run is regular
 * and the other semibold · one trailing affordance. **The trailing mark matches the behaviour**: a close
 * button when the notice is dismissible, otherwise a chevron when tapping it takes you somewhere, and
 * nothing at all when it's a passive advisory. A banner that must be resolved (a failed payment) is not
 * dismissible — it has no close button by design.
 *
 * All four tones share one geometry, so a column of banners is a set of equal-height rows: full content
 * width, `radius.default`, `space.md` / `size.12` padding, `touchTarget.comfortable` minimum height.
 */
export const NotificationBanner = forwardRef<ViewType, NotificationBannerProps>(function NotificationBanner(
  {
    message,
    emphasis,
    emphasisFirst = false,
    tone = 'neutral',
    icon = 'bell',
    leading,
    unread = false,
    onPress,
    onDismiss,
    dismissLabel = 'Dismiss notification',
    accessibilityLabel,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const c = toneColors(t, tone);
  const label = accessibilityLabel ?? [emphasisFirst ? emphasis : message, emphasisFirst ? message : emphasis].filter(Boolean).join(' ');

  const plain = (
    <Text variant="bodyXSmall" style={{ color: c.fg }}>
      {message}
    </Text>
  );
  const strong = emphasis ? (
    <Text variant="labelXSmall" style={{ color: c.fg }}>
      {emphasis}
    </Text>
  ) : null;

  const box = {
    width: '100%' as const,
    minHeight: t.touchTarget.comfortable,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: t.space.md,
    paddingHorizontal: t.space.md,
    paddingVertical: t.size['12'],
    borderRadius: t.radius.default,
    backgroundColor: c.bg,
  };

  /** Icon + text — the part that carries the message and, when tappable, owns the press. */
  const body = (
    <>
      {leading ?? (
        <View>
          <Icon name={icon} size="lg" color={c.icon} />
          {/* Unread dot — rides the icon's top-right corner. */}
          {unread ? (
            <View
              style={{
                position: 'absolute',
                top: -t.size['2'],
                right: -t.size['2'],
                width: t.size['8'],
                height: t.size['8'],
                borderRadius: t.radius.pill,
                backgroundColor: t.background.errorSolid,
              }}
            />
          ) : null}
        </View>
      )}

      <Text variant="bodyXSmall" style={{ flex: 1, color: c.fg }}>
        {emphasisFirst ? (
          <>
            {strong}
            {strong ? ' ' : null}
            {plain}
          </>
        ) : (
          <>
            {plain}
            {strong ? ' ' : null}
            {strong}
          </>
        )}
      </Text>

    </>
  );

  // Dismissible: the close button is a SIBLING of the tap area, never nested inside it — a button
  // inside a button is invalid on web and swallows the inner press on native. The row itself is a
  // plain container, and the message area (icon + text) owns the navigation press.
  if (onDismiss) {
    const inner = { flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.space.md };
    return (
      <View ref={ref} style={[box, style]} {...rest}>
        {onPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [inner, { opacity: pressed ? 0.7 : 1 }]}
          >
            {body}
          </Pressable>
        ) : (
          <View style={inner} accessibilityLabel={label}>
            {body}
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
          hitSlop={t.space.sm}
          onPress={() => {
            hapticTap();
            onDismiss();
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="x" size="sm" color={c.trailing} />
        </Pressable>
      </View>
    );
  }

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [box, { opacity: pressed ? 0.7 : 1 }, style]}
        {...rest}
      >
        {body}
        <Icon name="chevron-right" size="sm" color={c.trailing} />
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={[box, style]} accessibilityLabel={label} {...rest}>
      {body}
    </View>
  );
});
