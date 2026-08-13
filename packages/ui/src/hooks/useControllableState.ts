import { useCallback, useState } from 'react';

/**
 * Support both controlled and uncontrolled usage. When `controlled` is provided
 * the component is controlled; otherwise it manages its own state from
 * `defaultValue`.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const value = isControlled ? (controlled as T) : internal;
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
    },
    [isControlled],
  );
  return [value, setValue];
}
