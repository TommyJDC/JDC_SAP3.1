/**
 * Formats a Date object or a Firestore Timestamp into a readable string (e.g., "DD/MM/YYYY HH:mm").
 * Handles null or undefined inputs gracefully.
 * @param dateInput The Date object, Firestore Timestamp, or null/undefined.
 * @returns A formatted date string or 'N/A' if the input is invalid.
 */
export function formatDate(dateInput: Date | firebase.firestore.Timestamp | null | undefined): string {
  if (!dateInput) {
    return 'N/A';
  }

  let date: Date;
  // Check if it's a Firestore Timestamp and convert to Date
  if (typeof (dateInput as any)?.toDate === 'function') {
    date = (dateInput as firebase.firestore.Timestamp).toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    console.warn("Invalid date input provided to formatDate:", dateInput);
    return 'Date invalide'; // Or return 'N/A' or throw an error
  }

  // Check if the converted date is valid
  if (isNaN(date.getTime())) {
     console.warn("Invalid date after conversion in formatDate:", dateInput);
     return 'Date invalide';
  }


  try {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error, "Input was:", dateInput);
    return 'Erreur formatage';
  }
}

// Re-export Timestamp if needed elsewhere, though direct import is usually better
// import { Timestamp } from 'firebase/firestore';
// export { Timestamp };

// Namespace Firebase types if needed
import * as firebase from 'firebase/firestore';
