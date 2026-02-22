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
 * Validates number is within a specified range
 *
 * @param value - The number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns True if value is within range, false otherwise
 *
 * @example
 * validateNumberRange(5, 0, 10) // true
 * validateNumberRange(15, 0, 10) // false
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
 * Sanitizes string input for safe storage and display
 *
 * Performs the following operations:
 * - Removes leading/trailing whitespace
 * - Limits length to 1000 characters to prevent data bloat
 *
 * @param value - The string to sanitize
 * @returns Sanitized string (trimmed and length-limited)
 *
 * @example
 * sanitizeString("  hello world  ") // "hello world"
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

/**
 * Validates import CSV data schema for People
 */
export interface CSVImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateCSVImportSchema = (
  rows: Record<string, unknown>[],
): CSVImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(rows)) {
    errors.push("Import data must be an array of records");
    return { valid: false, errors, warnings };
  }

  if (rows.length === 0) {
    errors.push("Import data contains no records");
    return { valid: false, errors, warnings };
  }

  const requiredFields = ["name"];
  const optionalFields = [
    "area",
    "familyName",
    "phone",
    "email",
    "ageGroup",
    "notes",
  ];
  const allowedFields = new Set([...requiredFields, ...optionalFields]);

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 for 1-based indexing and header row

    if (typeof row !== "object" || row === null) {
      errors.push(`Row ${rowNum}: Invalid record format`);
      return;
    }

    const record = row as Record<string, unknown>;

    // Check required fields
    requiredFields.forEach((field) => {
      if (!record[field] || typeof record[field] !== "string") {
        errors.push(
          `Row ${rowNum}: Missing or invalid required field "${field}"`,
        );
      }
    });

    // Validate field types
    const nameValue = record.name;
    if (nameValue && typeof nameValue === "string") {
      if (nameValue.trim().length === 0) {
        errors.push(`Row ${rowNum}: Name cannot be empty`);
      } else if (nameValue.length > 255) {
        warnings.push(`Row ${rowNum}: Name exceeds 255 characters`);
      }
    }

    if (record.email && !validateEmail(String(record.email))) {
      warnings.push(`Row ${rowNum}: Invalid email format`);
    }

    if (record.phone && !validatePhone(String(record.phone))) {
      warnings.push(`Row ${rowNum}: Invalid phone format`);
    }

    // Warn about unknown fields
    Object.keys(record).forEach((field) => {
      if (!allowedFields.has(field)) {
        warnings.push(
          `Row ${rowNum}: Unknown field "${field}" will be ignored`,
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
