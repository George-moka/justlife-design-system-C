import React, { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { elevationToStyle } from '../../theme/style-helpers';
import { hexToRgba } from '../../primitives/RadialGlow';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

// LayoutAnimation needs an opt-in on (old-arch) Android; iOS/Fabric are fine, web is a no-op.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface BottomSheetProps extends Omit<ViewProps, 'children'> {
  /** Title shown at the top-left of the sheet. */
  title?: string;
  /**
   * Whether the sheet is shown. The sheet **animates in** when this becomes true and **animates out**
   * (then unmounts) when it becomes false — so a parent can keep it mounted and just flip `open`. Default
   * `true` (mount = open), which still animates in. Default `true`.
   */
  open?: boolean;
  /** Fired when the scrim **or** the close button is pressed. */
  onClose?: () => void;
  /** Circular close button in the top-right corner. Default `true`. */
  showClose?: boolean;
  /**
   * Trailing control on the TITLE row (e.g. the address sheet's country-flag button). When given it
   * takes the top-right corner and the close button steps aside — a sheet shows one trailing affordance.
   */
  titleAction?: ReactNode;
  /**
   * Turns the title row into a **step header**: a leading back chevron that returns to the previous
   * step (the address sheet's "Select a country" step). The sheet stays open.
   */
  onBack?: () => void;
  /** Hairline under the title row — for sheets whose body is a list of choices. Default `false`. */
  divider?: boolean;
  /**
   * Where the title column starts. `edge` (default) aligns it with the body's own `space.md` gutter —
   * right for a body of plain text, fields or flat rows. `content` pushes it to `space.xl`, so the title
   * lines up with the **text inside** a card list (card gutter 16 + card padding 16) instead of with the
   * card edges — the Figma address sheet's alignment.
   */
  titleInset?: 'edge' | 'content';
  /** Centred grabber handle at the top. Default `true`. */
  showGrabber?: boolean;
  /** Pinned footer (e.g. a primary action). Sits above the home-indicator inset. */
  footer?: ReactNode;
  /**
   * Hairline ABOVE the footer — for a sheet whose body outruns the sheet and scrolls **under** it. Without
   * it the last visible row and the footer's own content read as one block. Default `false` (a footer that
   * follows a body which fits needs no rule). */
  footerDivider?: boolean;
  /** Pinned header below the title (e.g. a search field) — stays fixed while the body scrolls. */
  header?: ReactNode;
  /**
   * Drops the header slot's side padding so the header can run edge to edge — for a horizontal scroller
   * (a filter row), which must span the full width and carry the gutter INSIDE it, or its items get
   * clipped at the padding line instead of scrolling past the sheet's edge. Default `false`.
   */
  headerBleed?: boolean;
  /**
   * Drops the BODY's side padding, for a sheet whose content is a list of **full-width rows** — a row
   * has to be pressable and highlightable edge to edge, so it carries the gutter in its own padding
   * (#60). Without this the rows stop at the sheet's padding line and read as a floating column.
   * Default `false`.
   */
  bodyBleed?: boolean;
  /**
   * How much of the host the sheet may fill, 0–1. Default `0.9`. Drop it (0.8) for a sheet that is a
   * long **list you scroll**: leaving more of the page uncovered is what says the sheet is a layer over
   * the screen rather than a new one. A short sheet is sized by its content and never reaches the cap.
   */
  maxHeightRatio?: number;
  /**
   * What a **resize** means for this sheet. The sheet animates its height when its body changes, but it
   * cannot tell a body SWAP (a filter tab, a step) from an ordinary re-render — `children` is a new
   * element every time — so a sheet that re-renders on every tap animated the whole commit, including
   * its own footer, and the price under your finger glided instead of changing. Pass a value that only
   * changes when the body genuinely becomes different content, and the animation is armed on that
   * alone. Omit it to keep the old any-change behaviour.
   */
  resizeKey?: string | number;
  /** Body content. Scrolls when it exceeds the capped height. */
  children?: ReactNode;
}

/**
 * Modal **bottom sheet**. A dimming scrim (tap to dismiss) over a surface that **slides up** from the
 * bottom with rounded **top** corners; the scrim **fades in** alongside it (and both reverse on close).
 * Anatomy: centred grabber · circular close in the top-right corner · left-aligned title · scrollable
 * body · optional pinned footer action.
 *
 * Header rhythm (Figma, ~64pt to the hairline): grabber `40×2` in `icon.muted` inside `space.sm`
 * padding, then a title row that pads only **below** it (`space.md`) — the grabber block is the top
 * breathing room. `divider` leaves that padding above the hairline, so the body re-opens `space.md`
 * below it; the footer clears the body by `space.md`. `titleInset` picks the title's column: `edge`
 * (`space.md`, aligned with the body gutter) or `content` (`space.xl`, aligned with the text inside a
 * card list).
 *
 * Rules (all tokenised): top corners `radius.2xl` (24); scrim `effects.overlay-default` @ `opacity.40`;
 * surface `elevation.sheet`; height capped at **90%** of the host; the footer clears the device home
 * indicator via `safeArea.bottom`. Renders as an absolute overlay filling its **positioned parent** (drop
 * it inside the screen container), so it stays inside a device frame rather than portalling out. Motion
 * uses the `motion` tokens (slide-up `decelerate`, slide-out `accelerate`); a `setTimeout` settles the end
 * state where `requestAnimationFrame` is throttled.
 */
export const BottomSheet = forwardRef<ViewType, BottomSheetProps>(function BottomSheet(
  {
    title,
    open = true,
    onClose,
    showClose = true,
    titleAction,
    onBack,
    divider = false,
    titleInset = 'edge',
    showGrabber = true,
    footer,
    footerDivider = false,
    header,
    headerBleed = false,
    bodyBleed = false,
    maxHeightRatio = 0.9,
    resizeKey,
    children,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const [rendered, setRendered] = useState(open);
  const [sheetH, setSheetH] = useState(0);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  // Grows the sheet's bottom padding by the keyboard height. The sheet is white + bottom-anchored, so this
  // keeps it glued to the screen bottom (no gap/other colour below it) while its content rises above the
  // keyboard. (Animating padding is a layout prop → JS driver, so the whole sheet uses the JS driver.)
  const bottomPad = useRef(new Animated.Value(t.safeArea.bottom)).current;
  const reducedMotion = useReducedMotion();

  /**
   * A sheet's content can change size while it is open — a filter tab with fewer rows, a step that swaps
   * the whole body. Anchored to the bottom, that snaps the TOP edge to a new place.
   *
   * This is armed BEFORE the commit, not corrected after it. Measuring the new content and gliding back
   * (an `onLayout` + `Animated` offset) cannot work: `onLayout` only fires once the new layout has been
   * laid out AND drawn, so there is always one frame at the new size before the correction lands — which
   * is exactly the flick. `LayoutAnimation` hands the frame change to the platform, which interpolates
   * from the old geometry, so there is no such frame. Native only; on web the change just applies.
   */
  const resizeSignal: ReactNode | string | number = resizeKey ?? children;
  const armedFor = useRef<ReactNode | string | number | undefined>(undefined);
  if (
    rendered &&
    open &&
    !reducedMotion &&
    Platform.OS !== 'web' &&
    armedFor.current !== undefined &&
    armedFor.current !== resizeSignal
  ) {
    LayoutAnimation.configureNext({
      duration: t.motion.duration.slow,
      // The frame itself eases; rows arriving or leaving fade rather than pop at full size.
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }
  armedFor.current = resizeSignal;

  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const to = open ? 1 : 0;
    const duration = open ? t.motion.duration.slow : t.motion.duration.medium;
    const easing = Easing.bezier(
      ...((open ? t.motion.easing.decelerate : t.motion.easing.accelerate) as [
        number,
        number,
        number,
        number,
      ]),
    );
    const anim = Animated.timing(progress, {
      toValue: to,
      duration,
      easing,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && !open) setRendered(false);
    });
    const settle = setTimeout(() => {
      progress.setValue(to);
      if (!open) setRendered(false);
    }, duration + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [open, rendered, t, progress]);

  // Keep the sheet's content above the keyboard by growing its bottom padding to safeArea + keyboard
  // height, matching the keyboard's own show/hide animation. The sheet stays bottom-anchored so its white
  // fills all the way down — nothing else shows below it. (No-op on web — no on-screen keyboard event.)
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const animateTo = (to: number, duration?: number) =>
      Animated.timing(bottomPad, {
        toValue: to,
        duration: duration || t.motion.duration.medium,
        easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
        useNativeDriver: false,
      }).start();
    const onShow = (e: { endCoordinates?: { height: number }; duration?: number }) =>
      animateTo(t.safeArea.bottom + (e.endCoordinates?.height ?? 0), e.duration);
    const onHide = (e: { duration?: number }) => animateTo(t.safeArea.bottom, e.duration);
    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [bottomPad, t]);

  if (!rendered) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetH || t.size['96'], 0],
  });

  return (
    <View
      ref={ref}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: t.zIndex.modal }}
      {...rest}
    >
      {/* Scrim — dims the screen (fades with the sheet); tap to dismiss. */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: hexToRgba(t.effects.overlayDefault, t.opacity['40']) },
          ]}
        />
      </Animated.View>
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          onLayout={(e) => {
            // Measure once (for the slide distance); the animated bottom padding would otherwise re-fire
            // this every frame.
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0 && sheetH === 0) setSheetH(h);
          }}
          style={[
            {
              maxHeight: `${maxHeightRatio * 100}%`,
              backgroundColor: t.background.surfaceRaised,
              borderTopLeftRadius: t.radius['2xl'],
              borderTopRightRadius: t.radius['2xl'],
              // Grows with the keyboard so the white sheet stays anchored to the screen bottom.
              paddingBottom: bottomPad,
              // Fade with the slide — also masks the pre-measure frame, so no flash before it slides up.
              opacity: progress,
              transform: [{ translateY }],
              ...elevationToStyle(t.elevation.sheet),
            },
            style,
          ]}
        >
          {/* Circular close — pinned to the sheet's top-right corner. */}
          {showClose && !titleAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{
                position: 'absolute',
                top: t.space.md,
                right: t.space.md,
                zIndex: 1,
                width: t.size['32'],
                height: t.size['32'],
                borderRadius: t.radius.pill,
                backgroundColor: t.background.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="x" size="sm" color={t.icon.secondary} />
            </Pressable>
          ) : null}

          {/* Grabber — drag/dismiss affordance. A wide, thin bar (Figma `drawer_line`): 40×2 in the
              muted mark colour, not a border tint, so it reads as a handle rather than a rule. */}
          {showGrabber ? (
            <View style={{ alignItems: 'center', paddingVertical: t.space.sm }}>
              <View
                style={{
                  width: t.size['40'],
                  height: t.size['2'],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.icon.muted,
                }}
              />
            </View>
          ) : null}

          {/* Title — the grabber block already supplies the breathing room above it, so the row only pads
              below; right inset clears the corner close button. The row's height is FIXED (`size.32`, the
              size of a sheet's trailing control) so the header is the same height whether or not a sheet
              has one — otherwise a plain title row collapses to its text and the hairline lands 12pt
              higher than on the sheet next to it. Same reasoning as #38's title row. */}
          {title ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                // Padding is inside the box in RN, so the floor is control + the row's own paddings.
                minHeight: t.size['32'] + (showGrabber ? t.space.none : t.space.md) + t.space.md,
                gap: t.space.sm,
                paddingLeft: titleInset === 'content' ? t.space.xl : t.space.md,
                paddingRight:
                  showClose && !titleAction
                    ? t.size['48']
                    : titleInset === 'content'
                      ? t.space.xl
                      : t.space.md,
                paddingTop: showGrabber ? t.space.none : t.space.md,
                paddingBottom: t.space.md,
              }}
            >
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  onPress={onBack}
                  hitSlop={t.space.sm}
                >
                  <Icon name="chevron-left" size="md" color={t.icon.primary} />
                </Pressable>
              ) : null}
              <Text variant="titleSmall" style={{ flex: 1 }}>
                {title}
              </Text>
              {titleAction}
            </View>
          ) : null}

          {/* Hairline under the header — separates the title row from a list body. */}
          {divider ? (
            <View style={{ height: t.borderWidth.hairline, backgroundColor: t.border.default }} />
          ) : null}

          {/* Pinned header (e.g. a search field, a filter row) — stays put while the body scrolls beneath
              it. Under a hairline it OWNS the rhythm on both sides (`space.md` above and below, the
              Figma sheet's 16/16) and the body's top padding stands down, so the two don't stack into a
              double gap. Without a rule it keeps its tighter `space.sm` and sits under the title block. */}
          {header ? (
            <View
              style={{
                paddingHorizontal: headerBleed ? t.space.none : t.space.md,
                paddingTop: divider ? t.space.md : t.space.none,
                paddingBottom: divider ? t.space.md : t.space.sm,
              }}
            >
              {header}
            </View>
          ) : null}

          {/* Body — scrolls when it exceeds the capped height. A `divider` puts the title row's bottom
              padding *above* the rule, so the body has to re-open the same gap below it. */}
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{
              paddingHorizontal: bodyBleed ? t.space.none : t.space.md,
              paddingTop: divider && !header ? t.space.md : t.space.none,
              paddingBottom: t.space.md,
              // A bled body owns its own rhythm — a gap here would push every full-width row apart.
              gap: bodyBleed ? t.space.none : t.space.sm,
            }}
          >
            {children}
          </ScrollView>

          {/* Pinned footer action, under its own hairline when the body scrolls beneath it. */}
          {footer ? (
            <>
              {footerDivider ? (
                <View
                  style={{ height: t.borderWidth.hairline, backgroundColor: t.border.default }}
                />
              ) : null}
              <View style={{ paddingHorizontal: t.space.md, paddingTop: t.space.md }}>{footer}</View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
});
