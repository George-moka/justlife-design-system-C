import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Toast, type ToastAction, type ToastTone } from './Toast';

export interface ToastOptions {
  tone?: ToastTone;
  /** Override the leading icon (Lucide name); `null` forces no icon. */
  icon?: string | null;
  action?: ToastAction;
  /** Force the trailing ✕ on/off (defaults: shown when there's no action). */
  dismissible?: boolean;
  /** Auto-dismiss after N ms. `0` = sticky. Default: 6000 with an action, else 4000. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: number;
  message: string;
  open: boolean;
}

export interface ToastApi {
  /** Show a toast; returns its id (pass to `dismiss`). */
  show: (message: string, options?: ToastOptions) => number;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  warning: (message: string, options?: ToastOptions) => number;
  /** Dismiss a toast by id, or the active one when no id is given. */
  dismiss: (id?: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Imperative toast API. Must be called under a `<ToastProvider>`. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>.');
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Where toasts appear. Default `top` (iOS-notification style — slides down from the top). */
  position?: 'top' | 'bottom';
  /** Safe-area insets so the bar clears the status bar / home indicator. Defaults to the `safeArea` tokens. */
  insets?: { top?: number; bottom?: number };
}

/**
 * **ToastProvider** — hosts the toast queue and renders the active `Toast` as an overlay that fills the
 * positioned parent (drop it around a screen/app root). One toast shows at a time; the rest queue and appear
 * in turn. Auto-dismisses after `duration` (6s with an action, else 4s; `0` keeps it sticky) and announces
 * each message to screen readers. Expose the imperative API with `useToast()`:
 *
 * ```tsx
 * const toast = useToast();
 * toast.success('Booking confirmed');
 * toast.error('Code expired', { action: { label: 'Retry', onPress: retry } });
 * ```
 */
export function ToastProvider({ children, position = 'top', insets }: ToastProviderProps) {
  const t = useTheme();
  const [queue, setQueue] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = queue[0];

  const beginDismiss = useCallback((id: number) => {
    setQueue((q) => q.map((e) => (e.id === id ? { ...e, open: false } : e)));
  }, []);

  const removeEntry = useCallback((id: number) => {
    setQueue((q) => q.filter((e) => e.id !== id));
  }, []);

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    const id = ++idRef.current;
    setQueue((q) => [...q, { id, message, open: true, ...options }]);
    if (typeof AccessibilityInfo?.announceForAccessibility === 'function') {
      AccessibilityInfo.announceForAccessibility(message);
    }
    return id;
  }, []);

  const dismiss = useCallback(
    (id?: number) => {
      setQueue((q) => {
        const target = id == null ? q[0] : q.find((e) => e.id === id);
        if (!target) return q;
        return q.map((e) => (e.id === target.id ? { ...e, open: false } : e));
      });
    },
    [],
  );

  // Auto-dismiss the active toast. Re-runs whenever the head of the queue changes.
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!active || !active.open) return;
    const duration = active.duration ?? (active.action ? 6000 : 4000);
    if (duration <= 0) return; // sticky
    timerRef.current = setTimeout(() => beginDismiss(active.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, beginDismiss]);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, o) => show(m, { tone: 'success', ...o }),
      error: (m, o) => show(m, { tone: 'error', ...o }),
      info: (m, o) => show(m, { tone: 'info', ...o }),
      warning: (m, o) => show(m, { tone: 'warning', ...o }),
      dismiss,
    }),
    [show, dismiss],
  );

  const topInset = insets?.top ?? t.safeArea.top;
  const bottomInset = insets?.bottom ?? t.safeArea.bottom;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Overlay host — fills the positioned parent; taps pass through except on the toast itself. */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: position === 'top' ? 0 : undefined,
          bottom: position === 'bottom' ? 0 : undefined,
          paddingTop: position === 'top' ? topInset + t.space.sm : 0,
          paddingBottom: position === 'bottom' ? bottomInset + t.space.sm : 0,
          paddingHorizontal: t.space.md,
          zIndex: t.zIndex.toast,
        }}
      >
        {active ? (
          <Toast
            key={active.id}
            message={active.message}
            tone={active.tone}
            icon={active.icon}
            action={active.action}
            dismissible={active.dismissible}
            open={active.open}
            position={position}
            inset={position === 'top' ? topInset : bottomInset}
            onDismiss={() => beginDismiss(active.id)}
            onExited={() => removeEntry(active.id)}
          />
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}
