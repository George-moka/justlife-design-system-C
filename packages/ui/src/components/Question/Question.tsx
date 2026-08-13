import React, { type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface QuestionProps {
  /** The question / section title. */
  title: string;
  /** Show an inline info icon right after the title. */
  info?: boolean;
  /** The control(s) below the title. */
  children?: ReactNode;
}

/**
 * **Question** — a labelled form section: a title (with an optional trailing info icon) over its control,
 * with consistent breathing room. The title is inset by `space.md`; the `children` are **full-bleed** so a
 * horizontal picker (`DatePicker`, `TimeSlotPicker`, …) can manage its own edge inset and bleed to the
 * screen edges. Used to stack the steps of the booking funnel.
 */
export function Question({ title, info, children }: QuestionProps) {
  const t = useTheme();
  return (
    <VStack gap="sm">
      {/* Title + info on a centred row — the icon vertically centres with the title instead of sinking to
          the text baseline. `sm` (16) is the shared size for an inline info icon next to a `labelMedium`
          label across the app (Payment Method, Need cleaning materials, …). `flexShrink` keeps the icon
          snug after a short title and lets a long one wrap beside it. */}
      <HStack align="center" gap="xs" style={{ paddingHorizontal: t.space.md }}>
        <Text variant="labelMedium" style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {info ? <Icon name="info" size="sm" color={t.icon.secondary} /> : null}
      </HStack>
      {children}
    </VStack>
  );
}
