/**
 * Represents the structure of user profile data stored in Firestore.
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: 'Admin' | 'Technician' | string; // Define known roles, allow string for flexibility
  secteurs: string[]; // Array of sectors the user belongs to
  displayName?: string; // Optional display name
}

/**
 * Represents a SAP ticket document from Firestore sector collections (CHR, HACCP, etc.).
 * Ensure these fields match your actual Firestore data structure.
 */
export interface SapTicket {
  id: string; // Document ID from Firestore
  date: Date | firebase.firestore.Timestamp; // Date of the ticket (ensure consistency)
  client: string; // Client name or identifier (used for grouping and searching - potentially legacy if raisonSociale is primary)
  raisonSociale?: string; // Official client name for grouping/sorting
  description: string; // Ticket description
  statut: string; // Ticket status (e.g., 'Nouveau', 'En cours', 'Résolu')
  secteur: string; // Added during fetch to indicate the source sector/collection
  demandeSAP?: string; // Optional field used for automatic status correction

  // Fields inspired by TicketList reference
  numeroSAP?: string; // Optional: SAP ticket number
  deducedSalesperson?: string; // Optional: Salesperson name
  adresse?: string; // Optional: Client address associated with the ticket
  telephone?: string; // Optional: Phone number(s), potentially comma-separated

  // Add other relevant fields from your Firestore documents:
  // codeClient?: string; // Optional: If you have a separate client code
  // priorite?: string; // Example: 'Haute', 'Moyenne', 'Basse'
  // technicien?: string; // Example: Assigned technician's name or ID
  // resolution?: string; // Example: Details of the resolution
  // ... other ticket properties
}

/**
 * Represents a Shipment document from the 'Envoi' collection in Firestore.
 */
export interface Shipment {
  id: string; // Document ID
  codeClient: string; // Client code
  nomClient: string; // Client name
  adresse: string;
  ville: string;
  codePostal: string;
  statutExpedition: 'OUI' | 'NON' | string; // Shipment status
  secteur: string; // Sector associated with the shipment
  dateCreation?: Date | firebase.firestore.Timestamp; // Optional: Creation date
  latitude?: number; // For map display
  longitude?: number; // For map display
  articleNom?: string; // Optional: Name of the article being shipped
  trackingLink?: string; // Optional: Link for tracking
  // ... other shipment properties
}

/**
 * Represents a snapshot of statistics stored in Firestore (e.g., in 'dailyStatsSnapshots').
 * Field names should match those used in getLatestStatsSnapshotsSdk mapping.
 */
export interface StatsSnapshot {
  id: string; // Document ID (e.g., date string 'YYYY-MM-DD')
  timestamp: Date | firebase.firestore.Timestamp; // When the snapshot was taken
  totalTickets: number;      // Matches Firestore field 'totalTickets'
  activeShipments: number;   // Matches Firestore field 'activeShipments' (now unused for dashboard evolution)
  activeClients: number;     // Matches Firestore field 'activeClients' (distinct client count from 'Envoi')
  // Add other stats fields as needed, ensuring names match Firestore document fields
}

/**
 * Represents a geocoding cache entry in Firestore.
 * Document ID is the normalized address string.
 */
export interface GeocodeCacheEntry {
  latitude: number;
  longitude: number;
  timestamp: firebase.firestore.FieldValue | firebase.firestore.Timestamp; // Use FieldValue for serverTimestamp on write
}

// Re-export AppUser from auth.service for convenience if needed elsewhere
// Or keep imports separate where used.
// export type { AppUser } from '~/services/auth.service';

// Namespace Firebase types if needed to avoid conflicts, e.g.,
import * as firebase from 'firebase/firestore';

// Note: Ensure you have consistent Timestamp handling (either Firebase Timestamps
// or JS Dates) throughout your application where these types are used.
// Conversion often happens when fetching/sending data.


// --- Dashboard Specific Types ---

/**
 * Data structure for the dashboard loader (currently minimal).
 */
export interface DashboardLoaderData {
  // Add any data loaded server-side if needed in the future
}

/**
 * Represents the authenticated user object structure, potentially from Firebase Auth.
 * Adjust based on your actual auth provider's user object.
 */
export interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  // Add other relevant user properties like photoURL, emailVerified, etc.
}
