import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { StarRating } from '../StarRating';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { ProfessionalAvatar } from '../ProfessionalAvatar';
import type { ServiceCategory } from '../CategoryShape';

/** A label → value row in the card's detail table. */
export interface PlanBookingRow {
  label: string;
  value: string;
  /** Render the value in the brand colour (e.g. the schedule / a price). */
  highlight?: boolean;
  /** Render the value semibold (e.g. the current booking). */
  bold?: boolean;
}

export interface PlanBookingProfessional {
  name: string;
  /** Rating shown in a star badge, e.g. 4.3. */
  rating?: string | number;
  /** Service vertical — selects the avatar's category shape. */
  category?: ServiceCategory;
  /** Professional photo URI (square cutout). */
  photo?: string;
  /** Custom avatar override; otherwise a category shape (or a fallback placeholder) is used. */
  avatar?: ReactNode;
}

export interface PlanBookingCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  /** Status pill text, e.g. "Active", "In Progress", "Completed", "Cancelled". */
  statusLabel: string;
  statusTone?: StatusTone;
  /** Lucide icon for the status pill (defaults to an alert for the `error` tone). */
  statusIcon?: string;
  /** Detail rows (package, schedule, booking, …). */
  rows: PlanBookingRow[];
  /** Optional discount badge text, e.g. "20% off". */
  discount?: string;
  /** Optional footer professional. */
  professional?: PlanBookingProfessional;
  /** The user's own rating of the professional (Completed bookings) — shows an "Edit" affordance. */
  userRating?: string | number;
  onEditRating?: () => void;
  /** Collect a rating — renders tappable stars in the footer (empty grey until tapped), e.g. an unrated
   *  completed booking. Takes the footer's right slot in place of a button. */
  onRate?: (rating: number) => void;
  /** Pre-filled stars for the {@link PlanBookingCardProps.onRate} input. */
  ratingValue?: number;
  /** Optional footer primary button. */
  buttonLabel?: string;
  /** Lucide icon for the button, e.g. "calendar", "settings", "rotate-cw". */
  buttonIcon?: string;
  onButtonPress?: () => void;
  /** Custom footer right-slot content — overrides the default rating stars / primary button (e.g. an
   *  animated rate → confirm → re-book cell). When set, `onRate`/`buttonLabel` are ignored for rendering. */
  footerRight?: ReactNode;
  /** Render the stacked-cards depth effect (subscriptions / recurring plans). */
  stacked?: boolean;
  onPress?: () => void;
}

/**
 * Booking / subscription summary card (Figma "Plan Booking Card"). A title + status
 * pill, a label→value detail table, an optional discount badge, and a footer with the
 * professional (avatar + name + rating, optional self-rating) and a primary action.
 *
 * `stacked` renders a layered depth effect for recurring/subscription plans. Every
 * value is tokenised (the stack layers approximate the Figma greys with `tertiary` +
 * hairline borders — see docs/HANDOFF.md backlog).
 */
export const PlanBookingCard = forwardRef<ViewType, PlanBookingCardProps>(function PlanBookingCard(
  {
    title,
    statusLabel,
    statusTone = 'neutral',
    statusIcon,
    rows,
    discount,
    professional,
    userRating,
    onEditRating,
    onRate,
    ratingValue,
    buttonLabel,
    buttonIcon,
    onButtonPress,
    footerRight,
    stacked = false,
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const hasFooter = !!professional || !!buttonLabel || !!onRate || !!footerRight;

  const content = (
    <VStack gap="sm">
      {/* Header — title + status pill */}
      <HStack align="center" gap="sm">
        <Text variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        <StatusBadge tone={statusTone} icon={statusIcon}>
          {statusLabel}
        </StatusBadge>
      </HStack>

      {/* Detail table */}
      {rows.length ? (
        <VStack gap="xs">
          {rows.map((r, i) => (
            <HStack key={`${r.label}-${i}`} align="center" gap="sm">
              <Text variant="bodyXSmall" color="secondary">
                {r.label}
              </Text>
              <Text
                variant={r.bold ? 'labelXSmall' : 'bodyXSmall'}
                color={r.highlight ? 'brand' : 'primary'}
                numberOfLines={1}
                style={{ flex: 1, textAlign: 'right' }}
              >
                {r.value}
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : null}

      {discount ? <Badge tone="success">{discount}</Badge> : null}

      {hasFooter ? (
        <>
          <View style={{ height: t.borderWidth.thin, backgroundColor: t.border.default }} />
          <VStack gap="xs">
            <HStack align="center" gap="sm">
              {professional ? (
                <HStack align="center" gap="sm" style={{ flex: 1 }}>
                  {professional.avatar ??
                    (professional.category ? (
                      <ProfessionalAvatar
                        category={professional.category}
                        photo={professional.photo}
                        size={40}
                        label={professional.name}
                      />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: t.radius.pill,
                          backgroundColor: t.background.tertiary,
                          borderWidth: t.borderWidth.hairline,
                          borderColor: t.border.default,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <Icon name="user" size="md" color={t.icon.muted} />
                      </View>
                    ))}
                  <VStack style={{ flex: 1, gap: t.size['2'] }}>
                    <Text variant="labelXSmall" numberOfLines={1}>
                      {professional.name}
                    </Text>
                    {professional.rating != null ? (
                      <Badge
                        tone="rating"
                        icon="star"
                        iconFilled
                        accessibilityLabel={`Rated ${professional.rating}`}
                      >
                        {String(professional.rating)}
                      </Badge>
                    ) : null}
                  </VStack>
                </HStack>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {footerRight ??
                (onRate ? (
                  <StarRating value={ratingValue ?? 0} onRate={onRate} size="md" />
                ) : buttonLabel ? (
                  <Button size="xs" variant="primary" compact leftIcon={buttonIcon} onPress={onButtonPress}>
                    {buttonLabel}
                  </Button>
                ) : null)}
            </HStack>
            {userRating != null ? (
              <HStack align="center" gap="xs">
                <Text variant="bodyMicro" color="secondary">
                  You rated
                </Text>
                <Icon name="star" size="xs" color={t.icon.info} fill={t.icon.info} />
                <Text variant="labelXXSmall">{String(userRating)}</Text>
                {onEditRating ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit your rating"
                    onPress={onEditRating}
                    hitSlop={t.space.sm}
                  >
                    <HStack align="center" gap="xs">
                      <Icon name="pencil" size="xs" color={t.icon.brand} />
                      <Text variant="labelXXSmall" style={{ color: t.text.brand }}>
                        Edit
                      </Text>
                    </HStack>
                  </Pressable>
                ) : null}
              </HStack>
            ) : null}
          </VStack>
        </>
      ) : null}
    </VStack>
  );

  const surfaceStyle = [
    {
      width: '100%' as const,
      backgroundColor: t.background.surface,
      borderRadius: t.radius.default,
      borderWidth: t.borderWidth.hairline,
      borderColor: t.border.default,
      padding: t.size['12'],
    },
    style,
  ];

  const surface = onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={surfaceStyle}>
      {content}
    </Pressable>
  ) : (
    <View style={surfaceStyle}>{content}</View>
  );

  // Flat card — no depth layers.
  if (!stacked) {
    return (
      <View ref={ref} style={{ width: '100%' }} {...rest}>
        {surface}
      </View>
    );
  }

  // Stacked (subscription) — two tokenised layers peek out behind / below the surface.
  const layer = {
    position: 'absolute' as const,
    backgroundColor: t.background.tertiary,
    borderRadius: t.radius.default,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.border.default,
  };
  // The deepest layer peeks `peekDepth` BELOW the surface via `position:absolute`, which does NOT add to the box
  // height — so a list `gap` measured from the box lets the peek eat into it, and the VISIBLE gap below a
  // stacked card ends up smaller than below a flat card (at an 8px gap the peek touches the next card). Reserve
  // that depth as `marginBottom` so the gap sits below the VISIBLE stack: the gap you SEE below a stacked card
  // then equals the gap below a flat card. `marginBottom` is external space — it doesn't move the
  // absolutely-positioned layers, so the peek itself is unchanged.
  const peekDepth = t.space.sm;
  return (
    <View ref={ref} style={{ width: '100%', position: 'relative', marginBottom: peekDepth }} {...rest}>
      <View style={[layer, { left: t.space.sm, right: t.space.sm, top: t.space.sm, bottom: -peekDepth }]} />
      <View style={[layer, { left: t.size['4'], right: t.size['4'], top: t.size['4'], bottom: -t.size['4'] }]} />
      {surface}
    </View>
  );
});
