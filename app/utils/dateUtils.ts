import { Timestamp } from 'firebase/firestore'; // Keep Timestamp import if needed for type checks

const frenchMonths: { [key: string]: number } = {
  'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
  'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
};

/**
 * Parses a French date string like "jour J mois AAAA" (e.g., "mardi 8 avril 2025").
 * Also handles potential Firestore Timestamps or JS Date objects.
 * Returns a Date object or null if parsing fails. Logs detailed warnings.
 */
export const parseFrenchDate = (dateInput: string | Date | Timestamp | undefined | null): Date | null => {
  const originalInputForLog = dateInput; // Keep original for logging

  if (!dateInput) {
    // console.log("[parseFrenchDate] Received falsy input:", originalInputForLog); // Optional log
    return null;
  }

  // Handle if input is already a Date or Timestamp
  if (dateInput instanceof Timestamp) {
    try {
      const date = dateInput.toDate();
      if (!isNaN(date.getTime())) {
        return date;
      } else {
        // Log if Timestamp conversion results in Invalid Date
        console.warn("[parseFrenchDate] Timestamp.toDate() resulted in Invalid Date. Original input:", originalInputForLog);
        return null;
      }
    } catch (e) {
      console.error(`[parseFrenchDate] Error converting Timestamp:`, e, "Original input:", originalInputForLog);
      return null;
    }
  }
  if (dateInput instanceof Date) {
    if (!isNaN(dateInput.getTime())) {
      return dateInput;
    } else {
      // Log if an Invalid Date object was passed directly
      console.warn("[parseFrenchDate] Received an Invalid Date object directly. Original input:", originalInputForLog);
      return null;
    }
  }

  // Handle string input
  if (typeof dateInput === 'string') {
    const dateString = dateInput; // Keep original for logs if needed

    // Clean the string: remove potential day name, trim whitespace
    const cleanedString = dateString.toLowerCase().replace(/^\w+\s/, '').trim();
    const parts = cleanedString.split(' ');

    // Expected format after cleaning: [dayNumber, monthName, yearNumber]
    if (parts.length === 3) {
      const dayStr = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];

      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      const monthIndex = frenchMonths[monthStr];

      if (!isNaN(day) && !isNaN(year) && monthIndex !== undefined) {
        // Create Date object using UTC
        try {
          const date = new Date(Date.UTC(year, monthIndex, day));
          // Basic validation
          if (date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day) {
            return date;
          } else {
            console.warn(`[parseFrenchDate] Date object creation resulted in mismatch for French string. Original input: "${originalInputForLog}"`);
          }
        } catch (e) {
          console.error(`[parseFrenchDate] Error creating Date object for French string: "${originalInputForLog}":`, e);
          return null;
        }
      } else {
         console.warn(`[parseFrenchDate] Failed to parse numeric components from French string: day=${dayStr}, month=${monthStr}, year=${yearStr}. Original input: "${originalInputForLog}"`);
      }
    } else {
       console.warn(`[parseFrenchDate] Unexpected format after cleaning French string: "${cleanedString}". Original input: "${originalInputForLog}"`);
    }

    // Fallback attempt for other string formats (e.g., ISO, DD/MM/YYYY)
    try {
      // Use original string for fallback, as cleaning might break standard formats
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        // console.log(`[parseFrenchDate] Fallback parsing successful for string. Original input: "${originalInputForLog}"`); // Optional log
        return parsedDate;
      }
    } catch (e) {
      // Ignore fallback error
    }

    // If all parsing attempts failed for the string
    console.warn(`[parseFrenchDate] All parsing attempts failed for string. Original input: "${originalInputForLog}"`);
    return null;
  }

  // If input type is unexpected
  console.warn(`[parseFrenchDate] Received unexpected input type: ${typeof dateInput}. Original input:`, originalInputForLog);
  return null;
};


/**
 * Formats a Date object into DD/MM/YYYY string using UTC date parts.
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    // No warning needed here, as parseFrenchDate should have already warned if applicable
    return 'N/A';
  }
  // Use UTC methods to match the UTC date creation in parseFrenchDate
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};


/**
 * Original formatDate function (might be used elsewhere) - formats to YYYY-MM-DD.
 * Uses local date parts.
 */
export const formatDate = (date: Date): string => {
  // Check for invalid date passed to this specific formatter
  if (!date || isNaN(date.getTime())) {
      console.warn("[formatDate YYYY-MM-DD] Received invalid date object.");
      return 'Invalid Date';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
