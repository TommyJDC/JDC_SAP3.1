import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc, // Import deleteDoc
  serverTimestamp,
  onSnapshot, // Import onSnapshot
  type Unsubscribe, // Import Unsubscribe type
  // getCountFromServer, // No longer needed
  type Firestore,
  type QuerySnapshot,
  type DocumentData,
  type SetOptions,
  Timestamp,
} from 'firebase/firestore';
import { db } from '~/firebase.config';
import type { UserProfile, SapTicket, Shipment, GeocodeCacheEntry, StatsSnapshot } from '~/types/firestore.types';
// Import the date parsing utility
import { parseFrenchDate } from '~/utils/dateUtils';

// --- Helper for Status Correction ---
const correctTicketStatus = (ticketData: DocumentData): { correctedStatus: string | null, needsUpdate: boolean } => {
  let currentStatus = ticketData.statut;
  const demandeSAPLower = ticketData.demandeSAP?.toLowerCase() ?? ''; // Handle undefined demandeSAP
  const needsRmaStatus = demandeSAPLower.includes('demande de rma');
  const isNotRmaStatus = currentStatus !== 'Demande de RMA';

  let correctedStatus: string | null = currentStatus; // Start with current status
  let needsUpdate = false;

  // Logic to automatically set status based on 'demandeSAP' or default to 'Nouveau'
  if (needsRmaStatus && isNotRmaStatus) {
    correctedStatus = 'Demande de RMA';
    needsUpdate = true;
  } else if (!currentStatus && !needsRmaStatus) { // Only default to Nouveau if not RMA and status is missing
    correctedStatus = 'Nouveau';
    needsUpdate = true;
  }

  // Return the potentially corrected status and if an update is needed
  return { correctedStatus: correctedStatus ?? null, needsUpdate };
};


// --- User Profile Functions ---

export const getUserProfileSdk = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { uid: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
    } else {
      console.log(`No profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Impossible de récupérer le profil utilisateur.");
  }
};

export const getAllUserProfilesSdk = async (): Promise<UserProfile[]> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('email'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    console.error("Error fetching all user profiles:", error);
    throw new Error("Impossible de récupérer la liste des utilisateurs.");
  }
};

export const createUserProfileSdk = async (
  uid: string,
  email: string,
  displayName: string,
  initialRole: string = 'Technician'
): Promise<UserProfile> => {
  if (!uid || !email || !displayName) {
    throw new Error("UID, email, and display name are required to create a profile.");
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    const newUserProfile: Omit<UserProfile, 'uid'> = {
      email,
      displayName,
      role: initialRole,
      secteurs: [],
    };
    await setDoc(userDocRef, newUserProfile);
    console.log(`User profile created successfully for UID: ${uid}`);
    return { uid, ...newUserProfile };
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error);
    throw new Error("Impossible de créer le profil utilisateur dans la base de données.");
  }
};

export const updateUserProfileSdk = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  if (!uid || !data || Object.keys(data).length === 0) {
    console.warn("Update user profile called with invalid UID or empty data.");
    return;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
    console.log(`User profile updated successfully for UID: ${uid}`);
  } catch (error) {
    console.error(`Error updating user profile for UID ${uid}:`, error);
    throw new Error("Impossible de mettre à jour le profil utilisateur.");
  }
};

// --- SAP Ticket Functions ---

/**
 * Updates a specific SAP ticket document within its sector collection.
 * @param sectorId The ID of the sector (collection name).
 * @param ticketId The ID of the ticket document to update.
 * @param data An object containing the fields to update.
 */
export const updateSAPTICKET = async (sectorId: string, ticketId: string, data: Partial<Omit<SapTicket, 'id' | 'secteur'>>): Promise<void> => {
  if (!sectorId || !ticketId || !data || Object.keys(data).length === 0) {
    console.warn("updateSAPTICKET called with invalid sectorId, ticketId, or empty data.");
    throw new Error("Identifiants de secteur/ticket ou données de mise à jour manquants.");
  }
  console.log(`[FirestoreService] Attempting to update ticket ${ticketId} in sector ${sectorId} with data:`, data);
  try {
    // Construct the document reference using the sectorId as the collection name
    const ticketDocRef = doc(db, sectorId, ticketId);
    await updateDoc(ticketDocRef, data);
    console.log(`[FirestoreService] Successfully updated ticket ${ticketId} in sector ${sectorId}.`);
  } catch (error: any) {
    console.error(`[FirestoreService] Error updating ticket ${ticketId} in sector ${sectorId}:`, error);
    if (error.code === 'permission-denied') {
      console.error(`[FirestoreService] CRITICAL: Firestore permission denied for update operation on collection '${sectorId}'. Check security rules.`);
      throw new Error(`Permission refusée par Firestore pour la mise à jour dans le secteur ${sectorId}. Vérifiez les règles de sécurité.`);
    } else if (error.code === 'not-found') {
        console.error(`[FirestoreService] Error: Document ${ticketId} not found in collection ${sectorId}.`);
        throw new Error(`Le ticket ${ticketId} n'a pas été trouvé dans le secteur ${sectorId}.`);
    }
    throw new Error(`Impossible de mettre à jour le ticket SAP ${ticketId}. Cause: ${error.message || error}`);
  }
};

/**
 * Fetches the most recent SAP tickets for the given sectors (one-time fetch).
 * Applies status correction logic to the returned data but DOES NOT update Firestore.
 */
export const getRecentTicketsForSectors = async (sectors: string[], count: number = 5): Promise<SapTicket[]> => {
  if (!sectors || sectors.length === 0) return [];
  console.log(`[FirestoreService] Fetching recent tickets for sectors: ${sectors.join(', ')}`);

  const ticketPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = collection(db, sector);
      const q = query(
        sectorCollectionRef,
        orderBy('date', 'desc'),
        limit(count) // Limit per sector
      );
      const querySnapshot = await getDocs(q);
       return querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Use parseFrenchDate to handle various date formats and invalid values
          const parsedDate = parseFrenchDate(data.date);
          // Apply status correction logic to the data being returned
          const { correctedStatus } = correctTicketStatus(data);
          return {
           id: doc.id,
           ...data,
            statut: correctedStatus ?? data.statut, // Use corrected status if available
            secteur: sector, // Add sector info
            date: parsedDate // Store the parsed Date object or null
          } as SapTicket;
       });
    } catch (error) {
      console.error(`Error fetching tickets for sector ${sector}:`, error);
      return []; // Return empty array for this sector on error
    }
  });

  try {
     const resultsBySector = await Promise.all(ticketPromises);
     const allTickets = resultsBySector.flat();
     // Sort all collected tickets by the parsed date descending, handling nulls
     allTickets.sort((a, b) => {
         // a.date and b.date are Date | null here
         // Handle null dates during sort
         if (!(b.date instanceof Date)) return -1; // B is null/invalid, A comes first (descending)
         if (!(a.date instanceof Date)) return 1;  // A is null/invalid, B comes first (descending)
         // Both are valid Date objects here, safe to call getTime()
         return b.date.getTime() - a.date.getTime();
     });
     console.log(`[FirestoreService] Found ${allTickets.length} tickets across sectors, returning top ${count}`);
    return allTickets.slice(0, count); // Return only the most recent 'count' tickets overall
  } catch (error) {
    console.error("Error merging ticket results:", error);
    throw new Error("Impossible de récupérer les tickets récents.");
  }
};

/**
 * Fetches ALL SAP tickets for the given sectors (one-time fetch).
 * Applies status correction logic to the returned data but DOES NOT update Firestore.
 */
export const getAllTicketsForSectorsSdk = async (sectors: string[]): Promise<SapTicket[]> => {
  if (!sectors || sectors.length === 0) {
    console.log("[FirestoreService] getAllTicketsForSectorsSdk: No sectors provided, returning [].");
    return [];
  }
  console.log(`[FirestoreService] Fetching ALL tickets (one-time) for sectors: ${sectors.join(', ')}`);

  const ticketPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = collection(db, sector);
      const q = query(sectorCollectionRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log(`[FirestoreService] Fetched ${querySnapshot.size} tickets for sector ${sector}.`);
       return querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Use parseFrenchDate to handle various date formats and invalid values
          const parsedDate = parseFrenchDate(data.date);
          // Apply status correction logic to the data being returned
          const { correctedStatus } = correctTicketStatus(data);
          return {
           id: doc.id,
           ...data,
            statut: correctedStatus ?? data.statut, // Use corrected status if available
            secteur: sector, // Add sector info
            date: parsedDate // Store the parsed Date object or null
          } as SapTicket;
       });
    } catch (error) {
      console.error(`Error fetching ALL tickets for sector ${sector}:`, error);
      return [];
    }
  });

  try {
     const resultsBySector = await Promise.all(ticketPromises);
     const allTickets = resultsBySector.flat();
     // Sort all collected tickets by the parsed date descending, handling nulls
     allTickets.sort((a, b) => {
         // a.date and b.date are Date | null here
         // Handle null dates during sort
         if (!(b.date instanceof Date)) return -1; // B is null/invalid, A comes first (descending)
         if (!(a.date instanceof Date)) return 1;  // A is null/invalid, B comes first (descending)
         // Both are valid Date objects here, safe to call getTime()
         return b.date.getTime() - a.date.getTime();
     });
     console.log(`[FirestoreService] Fetched a total of ${allTickets.length} tickets across all specified sectors.`);
    return allTickets;
  } catch (error) {
    console.error("Error merging ALL ticket results:", error);
    throw new Error("Impossible de récupérer tous les tickets SAP pour les secteurs spécifiés.");
  }
};

/**
 * Listens for real-time updates on ALL SAP tickets for the given sectors.
 * Applies status correction logic and performs background updates in Firestore if needed.
 *
 * @param sectors Array of sector names (collection names) to listen to.
 * @param callback Function to call with the updated array of SapTicket objects.
 * @param onError Function to call if an error occurs during listening.
 * @returns An object containing unsubscribe functions for each sector listener.
 */
export const listenToAllTicketsForSectorsSdk = (
  sectors: string[],
  callback: (tickets: SapTicket[]) => void,
  onError: (error: Error) => void
): { unsubscribe: () => void } => {
  if (!sectors || sectors.length === 0) {
    console.log("[FirestoreService] listenToAllTicketsForSectorsSdk: No sectors provided.");
    // Immediately call callback with empty array? Or let the caller handle it?
    // callback([]); // Optional: Call immediately if no sectors
    return { unsubscribe: () => {} }; // Return a no-op unsubscribe function
  }

  console.log(`[FirestoreService] Setting up REAL-TIME listeners for tickets in sectors: ${sectors.join(', ')}`);

  const sectorListeners: Unsubscribe[] = [];
  const allTicketsMap = new Map<string, SapTicket>(); // Use Map to store tickets from all sectors, keyed by ID

  sectors.forEach((sector) => {
    try {
      const sectorCollectionRef = collection(db, sector);
      const q = query(sectorCollectionRef, orderBy('date', 'desc')); // Order by date

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(`[FirestoreService] Listener update received for sector: ${sector} (${querySnapshot.size} docs)`);
        const updatePromises: Promise<void>[] = []; // Store update promises for this snapshot

        // Process changes within this sector
        querySnapshot.docChanges().forEach((change) => {
            const docSnap = change.doc;
            const ticketId = docSnap.id;

            if (change.type === "removed") {
                allTicketsMap.delete(ticketId);
                console.log(`[FirestoreService] Ticket removed: ${ticketId} from sector ${sector}`);
             } else { // 'added' or 'modified'
                 const data = docSnap.data();
                 // Use parseFrenchDate here as well
                 const parsedDate = parseFrenchDate(data.date);
                 const { correctedStatus, needsUpdate } = correctTicketStatus(data);

                 const ticket: SapTicket = {
                    id: ticketId,
                    ...data,
                     statut: correctedStatus ?? data.statut, // Use corrected status for UI immediately
                     secteur: sector,
                     date: parsedDate, // Store the parsed Date or null
                 } as SapTicket;

                 allTicketsMap.set(ticketId, ticket); // Add or update in the map

                // If status correction is needed, plan a background update
                if (needsUpdate && correctedStatus !== null) {
                    console.log(`[FirestoreService] Planning background status update for ticket ${ticketId} in ${sector} to: ${correctedStatus}`);
                    updatePromises.push(
                        updateDoc(docSnap.ref, { statut: correctedStatus }).catch(err => {
                            console.error(`[FirestoreService] FAILED background status update for ticket ${ticketId}:`, err);
                            // Optional: Revert status in map or notify user? For now, just log.
                        })
                    );
                }
            }
        });


        // Convert map values to array, sort, and call the main callback
        const currentAllTickets = Array.from(allTicketsMap.values());
        // Filter out tickets without raisonSociale before calling back
         const ticketsWithRaisonSociale = currentAllTickets.filter(t => t.raisonSociale);
         // Sort by the parsed date descending, handling nulls
         ticketsWithRaisonSociale.sort((a, b) => {
             // a.date and b.date are Date | null here
             // Handle null dates during sort
             if (!(b.date instanceof Date)) return -1; // B is null/invalid, A comes first (descending)
             if (!(a.date instanceof Date)) return 1;  // A is null/invalid, B comes first (descending)
             // Both are valid Date objects here, safe to call getTime()
             return b.date.getTime() - a.date.getTime();
         });
         callback(ticketsWithRaisonSociale);

        // Execute background updates if any were planned for this snapshot
        if (updatePromises.length > 0) {
          Promise.all(updatePromises)
            .then(() => console.log(`[FirestoreService] Finished ${updatePromises.length} background status updates for sector ${sector}.`))
            .catch(err => console.error(`[FirestoreService] Error during batch background status updates for sector ${sector}:`, err));
        }

      }, (error) => {
        console.error(`[FirestoreService] Error listening to sector ${sector}:`, error);
        onError(new Error(`Erreur d'écoute pour le secteur ${sector}: ${error.message}`));
        // Potentially unsubscribe other listeners or handle more gracefully
      });

      sectorListeners.push(unsubscribe);

    } catch (error: any) {
        console.error(`[FirestoreService] Failed to set up listener for sector ${sector}:`, error);
        onError(new Error(`Impossible de démarrer l'écoute pour le secteur ${sector}: ${error.message}`));
    }
  });

  // Return a single unsubscribe function that calls all individual unsubscribes
  const unsubscribeAll = () => {
    console.log(`[FirestoreService] Unsubscribing from ${sectorListeners.length} ticket listeners.`);
    sectorListeners.forEach(unsub => unsub());
  };

  return { unsubscribe: unsubscribeAll };
};


/**
 * Counts the total number of SAP tickets across the given sectors using getDocs.
 */
export const getTotalTicketCountSdk = async (sectors: string[]): Promise<number> => {
  if (!sectors || sectors.length === 0) {
      console.log("[FirestoreService] getTotalTicketCountSdk: No sectors provided, returning 0.");
      return 0;
  }
  console.log(`[FirestoreService] Counting total tickets via getDocs for sectors: ${sectors.join(', ')}`);

  const countPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = collection(db, sector);
      const q = query(sectorCollectionRef); // Simple query just to count docs
      const querySnapshot = await getDocs(q);
      console.log(`[FirestoreService] Fetched ${querySnapshot.size} docs for sector ${sector} count.`);
      return querySnapshot.size;
    } catch (error) {
      console.error(`Error counting tickets via getDocs for sector ${sector}:`, error);
      return 0; // Return 0 for this sector on error
    }
  });

  try {
    const counts = await Promise.all(countPromises);
    const totalCount = counts.reduce((sum, count) => sum + count, 0);
    console.log(`[FirestoreService] Total ticket count via getDocs across sectors: ${totalCount}`);
    return totalCount;
  } catch (error) {
    console.error("Error summing ticket counts from getDocs:", error);
    throw new Error("Impossible de calculer le nombre total de tickets.");
  }
};


// --- Shipment Functions ---

export const getAllShipments = async (userProfile: UserProfile | null): Promise<Shipment[]> => {
  if (!userProfile) {
    console.log("[FirestoreService][getAllShipments] Cannot fetch shipments, user profile is null.");
    return [];
  }

  console.log(`[FirestoreService][getAllShipments] Fetching shipments for user: ${userProfile.uid}, Role: ${userProfile.role}`);
  const shipmentsCollectionRef = collection(db, 'Envoi');
  let q;

  try {
    // Determine sectors based on role and profile
    const userSectors = userProfile.secteurs ?? [];

    if (userProfile.role === 'Admin') {
        // Admin ALWAYS sees all shipments, regardless of their assigned sectors.
        console.log("[FirestoreService][getAllShipments] Admin user. Fetching ALL shipments (ignoring profile sectors).");
        q = query(shipmentsCollectionRef, orderBy('nomClient')); // Order by client name
        console.log("[FirestoreService][getAllShipments] Query: Fetch all ordered by nomClient");

    } else { // Non-Admin
      const sectorsToQuery = userSectors;
      if (sectorsToQuery.length === 0) {
        console.log(`[FirestoreService][getAllShipments] Non-admin user ${userProfile.uid} has no assigned sectors. Returning empty list.`);
        return []; // Non-admin with no sectors sees nothing
      }
      console.log(`[FirestoreService][getAllShipments] Non-admin user. Querying sectors: ${sectorsToQuery.join(', ')}`);
      q = query(
        shipmentsCollectionRef,
        where('secteur', 'in', sectorsToQuery),
        orderBy('nomClient') // Order by client name
      );
      console.log(`[FirestoreService][getAllShipments] Query: Fetch where secteur IN [${sectorsToQuery.join(', ')}] ordered by nomClient`);
    }

    console.log("[FirestoreService][getAllShipments] Executing query...");
    const querySnapshot = await getDocs(q);
    console.log(`[FirestoreService][getAllShipments] Query successful. Fetched ${querySnapshot.size} documents.`);

    const shipments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Shipment));
    return shipments;

  } catch (error: any) { // Catch specific error type if possible, otherwise 'any'
    // --- Enhanced Error Logging ---
    console.error("[FirestoreService][getAllShipments] Error fetching shipments:", error);
    // Log the underlying error code and message if available (Firebase errors often have these)
    if (error.code) {
        console.error(`[FirestoreService][getAllShipments] Firestore Error Code: ${error.code}`);
    }
    if (error.message) {
        console.error(`[FirestoreService][getAllShipments] Firestore Error Message: ${error.message}`);
    }
     // Check specifically for permission denied or missing index errors
     if (error.code === 'permission-denied') {
         console.error("[FirestoreService][getAllShipments] CRITICAL: Firestore permission denied. Check security rules for 'Envoi' collection.");
         throw new Error("Permission refusée par Firestore. Vérifiez les règles de sécurité.");
     } else if (error.code === 'failed-precondition' && error.message && error.message.includes("index")) { // Check specifically for index error
         console.error("[FirestoreService][getAllShipments] CRITICAL: Firestore query requires an index. Check browser console for a link to create it.");
         throw new Error("Index Firestore manquant. Vérifiez la console du navigateur pour le créer.");
     } else {
         // Throw the generic error but the detailed logs above should help
         throw new Error(`Impossible de récupérer la liste des envois. Cause: ${error.message || error}`); // Include original message
     }
     // --- End Enhanced Error Logging ---
  }
};


export const getRecentShipmentsForSectors = async (sectors: string[], count: number = 5): Promise<Shipment[]> => {
  // Determine if we are fetching for specific sectors or all (admin case)
  const fetchAllSectors = !sectors || sectors.length === 0;

  if (fetchAllSectors) {
    console.log(`[FirestoreService] Fetching ${count} recent shipments across ALL sectors (Admin view).`);
  } else {
    console.log(`[FirestoreService] Fetching ${count} recent shipments for sectors: ${sectors.join(', ')}`);
  }

  try {
    const shipmentsCollectionRef = collection(db, 'Envoi');
    let q; // Declare query variable

    // Base query constraints: limit
    // TEMPORARILY REMOVED: orderBy('dateCreation', 'desc') to test if missing field causes issues
    const queryConstraints = [
        limit(count) // Limit directly in the query now
    ];

    if (fetchAllSectors) {
      // Admin: Query without sector filter, only limit
      q = query(shipmentsCollectionRef, ...queryConstraints);
    } else {
      // Non-Admin: Query with sector filter and limit
      // Ensure sectors is not empty before using 'in' query
      if (sectors.length > 0) {
          q = query(
              shipmentsCollectionRef,
              where('secteur', 'in', sectors),
              ...queryConstraints // Spread the common constraints (only limit now)
          );
      } else {
          // This case should technically not be reached due to the fetchAllSectors logic,
          // but as a safeguard, return empty if sectors is unexpectedly empty here.
          console.warn("[FirestoreService] getRecentShipmentsForSectors: Non-admin called with empty sectors array unexpectedly. Returning [].");
          return [];
      }
    }

    const querySnapshot = await getDocs(q);
    // Map documents, converting Timestamp if necessary
    const shipments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamp to JS Date if needed by the component
        const dateCreation = data.dateCreation instanceof Timestamp
            ? data.dateCreation.toDate()
            : (data.dateCreation ? new Date(data.dateCreation) : undefined); // Handle potential string/number dates too

        return {
            id: doc.id,
            ...data,
            dateCreation: dateCreation // Overwrite with JS Date or keep undefined
        } as Shipment;
    });

    // No need to sort/slice client-side anymore as query handles it.
    console.log(`[FirestoreService] Fetched ${shipments.length} recent shipments matching criteria.`);
    return shipments;
  } catch (error) {
    console.error("Error fetching recent shipments:", error);
    throw new Error("Impossible de récupérer les envois récents.");
  }
};


/**
 * Fetches ALL shipments for the given sectors (regardless of status).
 * Used internally by getDistinctClientCountFromEnvoiSdk.
 * MODIFIED: Now respects Admin role to fetch ALL shipments if needed.
 */
const getAllShipmentsForSectors = async (sectors: string[], isAdmin: boolean): Promise<Shipment[]> => {
  console.log(`[FirestoreService] getAllShipmentsForSectors: Fetching ALL shipments (any status). Admin: ${isAdmin}, Sectors: ${sectors.join(', ')}`);

  try {
    const shipmentsCollectionRef = collection(db, 'Envoi');
    let q;

    if (isAdmin) {
        // Admin fetches ALL shipments, ignoring sectors provided for counting purposes.
        console.log("[FirestoreService] getAllShipmentsForSectors: Admin detected, fetching all documents.");
        q = query(shipmentsCollectionRef); // No ordering needed, just fetching all for counting.
    } else {
        // Non-admin fetches only shipments matching their sectors.
        if (!sectors || sectors.length === 0) {
            console.log("[FirestoreService] getAllShipmentsForSectors: Non-admin with no sectors, returning [].");
            return [];
        }
        console.log(`[FirestoreService] getAllShipmentsForSectors: Non-admin, fetching for sectors: ${sectors.join(', ')}`);
        q = query(
          shipmentsCollectionRef,
          where('secteur', 'in', sectors)
        );
    }

    const querySnapshot = await getDocs(q);
    const shipments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Shipment));
    console.log(`[FirestoreService] getAllShipmentsForSectors: Fetched ${shipments.length} total shipments.`);
    return shipments;
  } catch (error) {
    console.error("Error fetching all shipments for sectors:", error);
    // Consider if this internal function should throw or return empty on error
    throw new Error("Impossible de récupérer tous les envois pour les secteurs.");
  }
};


/**
 * Gets the count of distinct clients based on ALL shipments ('Envoi' collection)
 * accessible to the user (all for Admin, sector-specific for others).
 * WARNING: Inefficient for large datasets as it fetches documents.
 */
export const getDistinctClientCountFromEnvoiSdk = async (userProfile: UserProfile | null): Promise<number> => {
   if (!userProfile) {
     console.log("[FirestoreService] getDistinctClientCountFromEnvoiSdk: No user profile provided, returning 0.");
     return 0;
   }

   const isAdmin = userProfile.role === 'Admin';
   const userSectors = userProfile.secteurs ?? [];

   console.warn(`[FirestoreService] Calculating distinct client count from 'Envoi' documents. Admin: ${isAdmin}, Sectors: ${userSectors.join(', ')}. This can be inefficient.`);

   try {
     // Fetch shipments based on user role (all for admin, filtered for others)
     const accessibleShipments = await getAllShipmentsForSectors(userSectors, isAdmin);
     console.log(`[FirestoreService] getDistinctClientCountFromEnvoiSdk: Fetched ${accessibleShipments.length} accessible shipments.`);

     if (accessibleShipments.length === 0) {
         console.log("[FirestoreService] getDistinctClientCountFromEnvoiSdk: No accessible shipments found, returning 0 distinct clients.");
         return 0;
     }

     const uniqueClientIdentifiers = new Set<string>();
     accessibleShipments.forEach((shipment) => {
       // Prioritize codeClient, then nomClient for uniqueness
       let clientIdentifier: string | null = null;
       if (shipment.codeClient && String(shipment.codeClient).trim() !== '') {
         clientIdentifier = String(shipment.codeClient).trim();
       } else if (shipment.nomClient && String(shipment.nomClient).trim() !== '') {
          // Use nomClient only if codeClient is missing or empty
          clientIdentifier = String(shipment.nomClient).trim();
       }
       if (clientIdentifier) {
         uniqueClientIdentifiers.add(clientIdentifier);
       }
     });

     const count = uniqueClientIdentifiers.size;
     console.log(`[FirestoreService] getDistinctClientCountFromEnvoiSdk: Found ${count} distinct clients from accessible 'Envoi' documents.`);
     return count;
   } catch (error) {
     console.error("[FirestoreService] getDistinctClientCountFromEnvoiSdk: Error calculating distinct client count:", error);
     throw new Error("Impossible de compter les clients distincts depuis les envois.");
   }
 };

/**
 * Deletes a specific shipment document from the 'Envoi' collection.
 * @param shipmentId The ID of the shipment document to delete.
 */
export const deleteShipmentSdk = async (shipmentId: string): Promise<void> => {
  if (!shipmentId) {
    throw new Error("Shipment ID is required to delete.");
  }
  console.log(`[FirestoreService] Attempting to delete shipment with ID: ${shipmentId}`);
  try {
    const shipmentDocRef = doc(db, 'Envoi', shipmentId);
    await deleteDoc(shipmentDocRef);
    console.log(`[FirestoreService] Successfully deleted shipment: ${shipmentId}`);
  } catch (error: any) {
    console.error(`[FirestoreService] Error deleting shipment ${shipmentId}:`, error);
    if (error.code === 'permission-denied') {
      console.error("[FirestoreService] CRITICAL: Firestore permission denied for delete operation. Check security rules for 'Envoi' collection.");
      throw new Error("Permission refusée par Firestore pour la suppression. Vérifiez les règles de sécurité.");
    }
    throw new Error(`Impossible de supprimer l'envoi. Cause: ${error.message || error}`);
  }
};


// --- Stats Snapshot Functions ---

export const getLatestStatsSnapshotsSdk = async (count: number = 1): Promise<StatsSnapshot[]> => {
  console.log(`[FirestoreService] Fetching latest ${count} stats snapshot(s) from 'dailyStatsSnapshots'...`);
  try {
    const snapshotsCollectionRef = collection(db, 'dailyStatsSnapshots');
    const q = query(
      snapshotsCollectionRef,
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const snapshots = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date(0));
        return {
            id: doc.id,
            timestamp: timestamp,
            totalTickets: data.totalTickets ?? 0,
            // activeShipments field in snapshot is now unused for dashboard evolution, but kept for potential other uses
            activeShipments: data.activeShipments ?? 0,
            // IMPORTANT: Ensure 'activeClients' in snapshot represents TOTAL distinct clients (ignoring status)
            activeClients: data.activeClients ?? 0,
        } as StatsSnapshot;
    });
    console.log(`[FirestoreService] Fetched ${snapshots.length} snapshot(s).`);
    return snapshots;
  } catch (error) {
    console.error("Error fetching latest stats snapshots:", error);
    throw new Error("Impossible de récupérer le dernier snapshot de statistiques.");
  }
};


// --- Geocode Cache ---
const GEOCODE_COLLECTION_NAME = 'geocodes';

export const getGeocodeFromCache = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const cacheDocRef = doc(db, GEOCODE_COLLECTION_NAME, address);
    const docSnap = await getDoc(cacheDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as GeocodeCacheEntry;
      console.log(`Geocode cache hit for address: ${address}`);
      return { latitude: data.latitude, longitude: data.longitude };
    } else {
      console.log(`Geocode cache miss for address: ${address}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting geocode from cache:", error);
    return null; // Don't throw, just return null on cache error
  }
};

export const saveGeocodeToCache = async (address: string, latitude: number, longitude: number): Promise<void> => {
  try {
    const cacheDocRef = doc(db, GEOCODE_COLLECTION_NAME, address);
    const cacheEntry: Omit<GeocodeCacheEntry, 'timestamp'> & { timestamp: any } = {
      latitude,
      longitude,
      timestamp: serverTimestamp(), // Use server timestamp
    };
    await setDoc(cacheDocRef, cacheEntry);
    console.log(`Geocode saved to cache for address: ${address}`);
  } catch (error) {
    console.error("Error saving geocode to cache:", error);
    // Decide if this should throw or just log based on application needs
  }
};
