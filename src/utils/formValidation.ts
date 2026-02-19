/**
 * Form validation and data validation utilities
 */

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone format (basic)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // phone is optional
  // Allow common phone formats: (555) 123-4567, 555-123-4567, 5551234567, etc.
  const phoneRegex = /^[\d\s\-()\.+]*[\d][\d\s\-()\.+]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 7;
};

/**
 * Validates required field is not empty
 */
export const validateRequired = (value: string | undefined | null): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Validates number is within range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

/**
 * Validates JSON structure matches expected schema
 */
export const validateJSONStructure = (
  data: unknown,
): { valid: boolean; error?: string } => {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Data must be an object" };
  }

  const obj = data as Record<string, unknown>;

  // Must have at least one of: people, activities, families
  if (
    !Array.isArray(obj.people) &&
    !Array.isArray(obj.activities) &&
    !Array.isArray(obj.families)
  ) {
    return {
      valid: false,
      error: "Missing required arrays: people, activities, or families",
    };
  }

  // Validate people array if present
  if (obj.people && !Array.isArray(obj.people)) {
    return { valid: false, error: '"people" must be an array' };
  }

  // Validate activities array if present
  if (obj.activities && !Array.isArray(obj.activities)) {
    return { valid: false, error: '"activities" must be an array' };
  }

  // Validate families array if present
  if (obj.families && !Array.isArray(obj.families)) {
    return { valid: false, error: '"families" must be an array' };
  }

  return { valid: true };
};

/**
 * Sanitizes string input to prevent issues
 */
export const sanitizeString = (value: string): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 1000); // Limit to 1000 chars
};

/**
 * Validates CSV data has required columns
 */
export const validateCSVColumns = (
  headers: string[],
  requiredColumns: string[],
): { valid: boolean; missingColumns: string[] } => {
  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col),
  );
  return {
    valid: missingColumns.length === 0,
    missingColumns,
  };
};
