import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack } from '../../primitives/Stack';

export interface SpecialInstructionsProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Prompt / title shown on the left. */
  title: string;
  /** The entered instructions. When present, the filled ("Added") layout is shown. */
  value?: string;
  /** Action label on the right. Defaults to "Edit" when filled, "Add" when empty. */
  actionLabel?: string;
  onPressAction?: () => void;
}

/**
 * Special Instructions field (Figma Special Instructions). Default (empty) shows
 * the prompt + an Add link; Added (filled) shows the title, an Edit link, and the
 * entered text. Colours tokenised.
 */
export const SpecialInstructions = forwardRef<ViewType, SpecialInstructionsProps>(
  function SpecialInstructions({ title, value, actionLabel, onPressAction, ...rest }, ref) {
    const t = useTheme();
    const filled = Boolean(value);
    const link = actionLabel ?? (filled ? 'Edit' : 'Add');

    const linkButton = (
      <Pressable accessibilityRole="button" accessibilityLabel={link} onPress={onPressAction}>
        <Text variant="labelXSmall" style={{ color: t.text.link }}>
          {link}
        </Text>
      </Pressable>
    );

    return (
      <View
        ref={ref}
        style={{
          width: '100%',
          backgroundColor: t.background.surface,
          borderRadius: t.radius.default,
          padding: t.space.md,
          gap: t.space.sm,
        }}
        {...rest}
      >
        <HStack justify="space-between" align="center" gap="sm">
          <Text variant="bodyXSmall" style={{ flexShrink: 1 }}>
            {title}
          </Text>
          {linkButton}
        </HStack>
        {filled ? (
          <Text variant="bodyXSmall" color="secondary">
            {value}
          </Text>
        ) : null}
      </View>
    );
  },
);
