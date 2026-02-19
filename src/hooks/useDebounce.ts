import { useEffect, useRef, useCallback } from "react";

/**
 * Debounce hook to delay function execution
 * Useful for expensive operations triggered by user input (e.g., date picker changes)
 */
export const useDebounce = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 300,
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
