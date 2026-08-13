// Minimal ambient types for `@react-native-masked-view/masked-view` so @justlife/ui typechecks the
// NATIVE ProgressiveBlur. The real module is provided at runtime by the Expo app (apps/prototype,
// bundled in Expo Go) and resolved by Metro; web uses ProgressiveBlur.web.tsx (CSS `mask-image`) and
// never imports this module.
declare module '@react-native-masked-view/masked-view' {
  import type { ComponentType, ReactElement, ReactNode } from 'react';
  import type { ViewProps } from 'react-native';
  export interface MaskedViewProps extends ViewProps {
    /** Rendered into an alpha mask: opaque pixels reveal the children, transparent ones hide them. */
    maskElement: ReactElement;
    children?: ReactNode;
  }
  const MaskedView: ComponentType<MaskedViewProps>;
  export default MaskedView;
}
