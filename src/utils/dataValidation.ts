import { Person } from "../types";

/**
 * Validates that a value is an array and optionally filters items
 *
 * @param value - The value to validate as an array
 * @param itemValidator - Optional function to validate and filter array items
 * @returns Validated/filtered array, or empty array if input is not an array
 *
 * @example
 * const numbers = validateArray<number>(input, (item) => typeof item === 'number');
 */
export const validateArray = <T>(
  value: unknown,
  itemValidator?: (item: unknown) => boolean,
): T[] => {
  if (!Array.isArray(value)) {
    console.warn("Expected array but got:", typeof value);
    return [];
  }

  if (itemValidator) {
    return value.filter(itemValidator) as T[];
  }

  return value as T[];
};

/**
 * Validates person object has required fields
 */
export const validatePerson = (item: unknown): item is Person => {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const person = item as Record<string, unknown>;
  return (
    typeof person.id === "string" &&
    typeof person.name === "string" &&
    typeof person.ageGroup === "string"
  );
};

/**
 * Validates a date string is valid ISO format
 */
export const validateDate = (dateString: unknown): boolean => {
  if (typeof dateString !== "string") {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Safe number conversion with fallback
 */
export const toNumber = (value: unknown, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Safe percentage calculation
 */
export const safePercentage = (
  value: number,
  total: number,
  decimals: number = 0,
): number => {
  if (total === 0) {
    return 0;
  }

  const percentage = (value / total) * 100;
  const multiplier = Math.pow(10, decimals);
  return Math.round(percentage * multiplier) / multiplier;
};
