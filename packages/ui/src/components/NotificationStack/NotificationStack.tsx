import React, { forwardRef, useState, type ReactNode } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon/Icon';
import { NotificationBanner, type NotificationTone } from '../NotificationBanner';
import type { Tokens } from '@justlife/tokens';

// LayoutAnimation needs an opt-in on (old-arch) Android; iOS/Fabric are fine, web is a no-op.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface NotificationItem {
  /** Stable identity — survives dismissing a sibling. */
  key: string;
  tone?: NotificationTone;
  icon?: string;
  /** Replaces the icon with a lockup (a payment provider's logo). */
  leading?: ReactNode;
  message: string;
  emphasis?: string;
  emphasisFirst?: boolean;
  unread?: boolean;
  onPress?: () => void;
  /** Omit for a notice that must be resolved — it then carries no close button. */
  onDismiss?: () => void;
}

export interface NotificationStackProps extends Omit<ViewProps, 'children'> {
  /**
   * Notices in **priority order** — `items[0]` is the one the user sees while the stack is collapsed,
   * so rank them by what breaks if ignored, not by arrival time.
   */
  items: NotificationItem[];
  /** How many peek slivers sit behind the top card. Default 2. */
  maxPeek?: number;
  /** Controlled expansion; omit to let the stack own it. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

/** The tint behind each tone — the peek slivers wear it, so you can tell what's waiting underneath. */
function toneBg(t: Tokens, tone: NotificationTone = 'neutral') {
  switch (tone) {
    case 'danger':
      return t.background.error;
    case 'warning':
      return t.notification.bg.warning;
    case 'brand':
      return t.background.selected;
    case 'neutral':
    default:
      return t.background.tertiary;
  }
}

function Banner({ item }: { item: NotificationItem }) {
  return (
    <NotificationBanner
      tone={item.tone}
      icon={item.icon}
      leading={item.leading}
      message={item.message}
      emphasis={item.emphasis}
      emphasisFirst={item.emphasisFirst}
      unread={item.unread}
      onPress={item.onPress}
      onDismiss={item.onDismiss}
    />
  );
}

/**
 * **A deck of notifications.** Several notices can be true at once — a failed payment, a booking that
 * needs input, tomorrow's cleaner, a weather advisory, a new message — and rendering them all pushes the
 * page below the fold. So the stack shows **one** live banner (the highest-priority item, still tappable
 * and dismissible in place) with the rest as tinted peek slivers behind it, and a quiet "N more" toggle
 * that expands the full list.
 *
 * Two consequences worth keeping: Home's height stops depending on how many notifications exist, and the
 * one thing the user must act on is never buried — provided callers pass `items` **ranked**.
 *
 * The wrapper reserves the peek depth as bottom margin, so the visible gap under a collapsed deck matches
 * every other gap on the page (rule #41). The slivers carry the tone of the notice underneath (a red
 * sliver means something urgent is waiting) with a hairline edge, because the tints alone disappear
 * against the page canvas. Expanding animates via `LayoutAnimation` and is gated on reduce-motion (#35).
 */
export const NotificationStack = forwardRef<ViewType, NotificationStackProps>(function NotificationStack(
  { items, maxPeek = 2, expanded, onExpandedChange, style, ...rest },
  ref,
) {
  const t = useTheme();
  const reducedMotion = useReducedMotion();
  const [ownOpen, setOwnOpen] = useState(false);
  const open = expanded ?? ownOpen;

  const PEEK = t.space.xs;
  const behind = items.slice(1, 1 + maxPeek);
  const hidden = items.length - 1;

  if (items.length === 0) return null;

  const toggle = () => {
    if (!reducedMotion) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          t.motion.duration.medium,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
    }
    const next = !open;
    if (expanded === undefined) setOwnOpen(next);
    onExpandedChange?.(next);
  };

  const moreToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={open ? 'Show fewer notifications' : `Show ${hidden} more notifications`}
      onPress={toggle}
      hitSlop={t.space.sm}
      style={({ pressed }) => ({ alignSelf: 'center', opacity: pressed ? 0.6 : 1, paddingTop: t.space.sm })}
    >
      <HStack gap="xs" align="center">
        <Text variant="labelXSmall" color="secondary">
          {open ? 'Show less' : `${hidden} more`}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" color={t.icon.secondary} />
      </HStack>
    </Pressable>
  );

  // A single notice is just a banner — no deck, no toggle, nothing to expand.
  if (items.length === 1) {
    return (
      <View ref={ref} style={style} {...rest}>
        <Banner item={items[0]} />
      </View>
    );
  }

  if (open) {
    return (
      <VStack ref={ref} gap="sm" style={style} {...rest}>
        {items.map((item) => (
          <Banner key={item.key} item={item} />
        ))}
        {moreToggle}
      </VStack>
    );
  }

  return (
    <VStack ref={ref} gap="none" style={style} {...rest}>
      {/* Reserve the peek depth so the gap BELOW the deck matches every other gap on the page (#41). */}
      <View style={{ marginBottom: PEEK * behind.length }}>
        {/* Deepest sliver first — declaration order is z-order in RN, so these sit behind the card. */}
        {behind
          .map((item, i) => ({ item, depth: behind.length - i }))
          .sort((a, b) => b.depth - a.depth)
          .map(({ item, depth }) => (
            <Pressable
              key={item.key}
              // Decorative: the toggle below is the accessible control, so the slivers stay out of the
              // a11y tree rather than repeating its label three times.
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              focusable={false}
              onPress={toggle}
              style={{
                position: 'absolute',
                left: t.space.sm * depth,
                right: t.space.sm * depth,
                top: 0,
                bottom: -PEEK * depth,
                borderRadius: t.radius.default,
                backgroundColor: toneBg(t, item.tone),
                // The tints are pale enough to vanish against the canvas — a hairline keeps the deck
                // edge readable whatever sits underneath it.
                borderWidth: t.borderWidth.hairline,
                borderColor: t.border.default,
              }}
            />
          ))}
        <Banner item={items[0]} />
      </View>
      {moreToggle}
    </VStack>
  );
});
