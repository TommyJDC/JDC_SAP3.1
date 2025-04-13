var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/utils/dateUtils.ts
import { Timestamp } from "firebase/firestore";
var frenchMonths, parseFrenchDate, formatDateForDisplay, getWeekDateRangeForAgenda, init_dateUtils = __esm({
  "app/utils/dateUtils.ts"() {
    "use strict";
    frenchMonths = {
      janvier: 0,
      f\u00E9vrier: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      ao\u00FBt: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      d\u00E9cembre: 11
    }, parseFrenchDate = (dateInput) => {
      let originalInputForLog = dateInput;
      if (!dateInput)
        return null;
      if (dateInput instanceof Timestamp)
        try {
          let date = dateInput.toDate();
          return isNaN(date.getTime()) ? (console.warn("[parseFrenchDate] Timestamp.toDate() resulted in Invalid Date. Original input:", originalInputForLog), null) : date;
        } catch (e) {
          return console.error("[parseFrenchDate] Error converting Timestamp:", e, "Original input:", originalInputForLog), null;
        }
      if (dateInput instanceof Date)
        return isNaN(dateInput.getTime()) ? (console.warn("[parseFrenchDate] Received an Invalid Date object directly. Original input:", originalInputForLog), null) : dateInput;
      if (typeof dateInput == "string") {
        let dateString = dateInput, cleanedString = dateString.toLowerCase().replace(/^\w+\s/, "").trim(), parts = cleanedString.split(" ");
        if (parts.length === 3) {
          let dayStr = parts[0], monthStr = parts[1], yearStr = parts[2], day = parseInt(dayStr, 10), year = parseInt(yearStr, 10), monthIndex = frenchMonths[monthStr];
          if (!isNaN(day) && !isNaN(year) && monthIndex !== void 0)
            try {
              let date = new Date(Date.UTC(year, monthIndex, day));
              if (date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day)
                return date;
              console.warn(`[parseFrenchDate] Date object creation resulted in mismatch for French string. Original input: "${originalInputForLog}"`);
            } catch (e) {
              return console.error(`[parseFrenchDate] Error creating Date object for French string: "${originalInputForLog}":`, e), null;
            }
          else
            console.warn(`[parseFrenchDate] Failed to parse numeric components from French string: day=${dayStr}, month=${monthStr}, year=${yearStr}. Original input: "${originalInputForLog}"`);
        } else
          console.warn(`[parseFrenchDate] Unexpected format after cleaning French string: "${cleanedString}". Original input: "${originalInputForLog}"`);
        try {
          let parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime()))
            return parsedDate;
        } catch {
        }
        return console.warn(`[parseFrenchDate] All parsing attempts failed for string. Original input: "${originalInputForLog}"`), null;
      }
      return console.warn(`[parseFrenchDate] Received unexpected input type: ${typeof dateInput}. Original input:`, originalInputForLog), null;
    }, formatDateForDisplay = (date) => {
      if (!date || isNaN(date.getTime()))
        return "N/A";
      let day = String(date.getUTCDate()).padStart(2, "0"), month = String(date.getUTCMonth() + 1).padStart(2, "0"), year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }, getWeekDateRangeForAgenda = (today = /* @__PURE__ */ new Date()) => {
      let currentDay = today.getUTCDay(), daysToAdd = 0;
      currentDay === 6 ? daysToAdd = 2 : currentDay === 0 ? daysToAdd = 1 : daysToAdd = 1 - currentDay;
      let startOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysToAdd));
      startOfWeek.setUTCHours(0, 0, 0, 0);
      let endOfWeek = new Date(startOfWeek);
      return endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6), endOfWeek.setUTCHours(23, 59, 59, 999), { startOfWeek, endOfWeek };
    };
  }
});

// app/firebase.admin.config.server.ts
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from "firebase-admin/app";
var dbAdmin, init_firebase_admin_config_server = __esm({
  "app/firebase.admin.config.server.ts"() {
    "use strict";
    if (getAdminApps().length === 0) {
      console.log("[FirebaseAdminConfig] No existing apps found. Initializing Firebase Admin SDK...");
      try {
        process.env.GOOGLE_APPLICATION_CREDENTIALS || console.warn("[FirebaseAdminConfig] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Admin SDK might not authenticate properly."), initializeAdminApp(), console.log("[FirebaseAdminConfig] Firebase Admin SDK initialized successfully.");
      } catch (error) {
        throw console.error("[FirebaseAdminConfig] CRITICAL: Failed to initialize Firebase Admin SDK:", error), new Error("Failed to initialize Firebase Admin SDK");
      }
    } else
      console.log("[FirebaseAdminConfig] Firebase Admin SDK already initialized.");
    try {
      dbAdmin = getAdminFirestore();
    } catch (error) {
      throw console.error("[FirebaseAdminConfig] CRITICAL: Failed to get Firestore instance from Admin SDK:", error), new Error("Failed to get Firestore instance from Admin SDK. Ensure initialization succeeded.");
    }
  }
});

// app/services/firestore.service.server.ts
import { Timestamp as Timestamp2, FieldValue } from "firebase-admin/firestore";
var correctTicketStatus, getUserProfileSdk, createUserProfileSdk, updateUserProfileSdk, getAllUserProfilesSdk, addArticleImageUrl, deleteArticleImageUrl, searchArticles, updateSAPTICKET, getRecentTicketsForSectors, getAllTicketsForSectorsSdk, getTotalTicketCountSdk, getAllShipments, getRecentShipmentsForSectors, getAllShipmentsForSectors, getDistinctClientCountFromEnvoiSdk, deleteShipmentSdk, getLatestStatsSnapshotsSdk, GEOCODE_COLLECTION_NAME, getGeocodeFromCache, saveGeocodeToCache, init_firestore_service_server = __esm({
  "app/services/firestore.service.server.ts"() {
    "use strict";
    init_dateUtils();
    init_firebase_admin_config_server();
    correctTicketStatus = (ticketData) => {
      let currentStatus = ticketData.statut, needsRmaStatus = (ticketData.demandeSAP?.toLowerCase() ?? "").includes("demande de rma"), isNotRmaStatus = currentStatus !== "Demande de RMA", correctedStatus = currentStatus, needsUpdate = !1;
      return needsRmaStatus && isNotRmaStatus ? (correctedStatus = "Demande de RMA", needsUpdate = !0) : !currentStatus && !needsRmaStatus && (correctedStatus = "Nouveau", needsUpdate = !0), { correctedStatus: correctedStatus ?? null, needsUpdate };
    }, getUserProfileSdk = async (id) => {
      if (!id)
        return null;
      console.log(`[FirestoreService Admin] Getting profile for ID: ${id}`);
      try {
        let userDocSnap = await dbAdmin.collection("users").doc(id).get();
        if (userDocSnap.exists) {
          let data = userDocSnap.data(), createdAt = data.createdAt instanceof Timestamp2 ? data.createdAt.toDate() : void 0, updatedAt = data.updatedAt instanceof Timestamp2 ? data.updatedAt.toDate() : void 0;
          return {
            uid: id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            secteurs: data.secteurs,
            createdAt,
            updatedAt
          };
        } else
          throw console.log(`[FirestoreService Admin] No profile found for ID: ${id}`), new Error(`User profile not found for ID: ${id}`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error fetching user profile for ID ${id}:`, error), error.message?.includes("not found") ? error : new Error(`Impossible de r\xE9cup\xE9rer le profil utilisateur (ID: ${id}). Cause: ${error.message || error}`);
      }
    }, createUserProfileSdk = async (id, email, displayName, initialRole = "Technician") => {
      if (!id || !email || !displayName)
        throw new Error("ID, email, and display name are required to create a profile.");
      console.log(`[FirestoreService Admin] Creating profile for ID: ${id}, Email: ${email}`);
      try {
        let userDocRef = dbAdmin.collection("users").doc(id);
        (await userDocRef.get()).exists && console.warn(`[FirestoreService Admin] Profile already exists for ID: ${id}. Overwriting.`);
        let newUserProfileDataBase = {
          email,
          displayName,
          role: initialRole,
          secteurs: []
        };
        return await userDocRef.set({
          ...newUserProfileDataBase,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
          // Also set updatedAt on creation
        }), console.log(`[FirestoreService Admin] User profile created/updated successfully for ID: ${id}`), { uid: id, ...newUserProfileDataBase };
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error creating user profile for ID ${id}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied during profile creation. Check service account permissions and Firestore rules."), new Error("Permission refus\xE9e par Firestore lors de la cr\xE9ation du profil.")) : new Error(`Impossible de cr\xE9er le profil utilisateur (ID: ${id}). Cause: ${error.message || error}`);
      }
    }, updateUserProfileSdk = async (uid, data) => {
      if (!uid || !data || Object.keys(data).length === 0) {
        console.warn("[FirestoreService Admin] Update user profile called with invalid UID or empty data.");
        return;
      }
      console.log(`[FirestoreService Admin] Updating profile for UID: ${uid}`);
      try {
        let userDocRef = dbAdmin.collection("users").doc(uid), updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
        await userDocRef.update(updateData), console.log(`[FirestoreService Admin] User profile updated successfully for UID: ${uid}`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error updating user profile for UID ${uid}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied during profile update."), new Error("Permission refus\xE9e par Firestore lors de la mise \xE0 jour du profil.")) : new Error(`Impossible de mettre \xE0 jour le profil utilisateur (UID: ${uid}). Cause: ${error.message || error}`);
      }
    }, getAllUserProfilesSdk = async () => {
      console.log("[FirestoreService Admin] Fetching all user profiles...");
      try {
        let profiles = (await dbAdmin.collection("users").orderBy("email").get()).docs.map((doc2) => {
          let data = doc2.data(), createdAt = data.createdAt instanceof Timestamp2 ? data.createdAt.toDate() : void 0, updatedAt = data.updatedAt instanceof Timestamp2 ? data.updatedAt.toDate() : void 0;
          return {
            uid: doc2.id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            secteurs: data.secteurs,
            createdAt,
            updatedAt
          };
        });
        return console.log(`[FirestoreService Admin] Fetched ${profiles.length} profiles.`), profiles;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error fetching all user profiles:", error), new Error(`Impossible de r\xE9cup\xE9rer la liste des utilisateurs. Cause: ${error.message || error}`);
      }
    }, addArticleImageUrl = async (articleId, imageUrl) => {
      if (!articleId || !imageUrl)
        throw new Error("Article ID and image URL are required.");
      console.log(`[FirestoreService Admin] Adding image URL to article ${articleId}...`);
      try {
        await dbAdmin.collection("articles").doc(articleId).update({
          imageUrls: FieldValue.arrayUnion(imageUrl)
        }), console.log(`[FirestoreService Admin] Image URL successfully added to article ${articleId}.`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error adding image URL to article ${articleId}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? new Error("Permission refus\xE9e pour mettre \xE0 jour l'article.") : error.code === 5 || error.code === "NOT_FOUND" ? new Error(`L'article avec l'ID ${articleId} n'a pas \xE9t\xE9 trouv\xE9.`) : new Error(`Impossible d'ajouter l'URL de l'image \xE0 l'article : ${error.message || error.code}`);
      }
    }, deleteArticleImageUrl = async (articleId, imageUrl) => {
      if (!articleId || !imageUrl)
        throw new Error("Article ID and image URL are required for deletion.");
      console.log(`[FirestoreService Admin] Removing image URL from article ${articleId}...`);
      try {
        await dbAdmin.collection("articles").doc(articleId).update({
          imageUrls: FieldValue.arrayRemove(imageUrl)
        }), console.log(`[FirestoreService Admin] Image URL successfully removed from article ${articleId}.`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error removing image URL from article ${articleId}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? new Error("Permission refus\xE9e pour mettre \xE0 jour l'article.") : error.code === 5 || error.code === "NOT_FOUND" ? new Error(`L'article avec l'ID ${articleId} n'a pas \xE9t\xE9 trouv\xE9.`) : new Error(`Impossible de supprimer l'URL de l'image de l'article : ${error.message || error.code}`);
      }
    }, searchArticles = async (criteria) => {
      let { code, nom } = criteria, trimmedCode = code?.trim(), trimmedNom = nom?.trim(), nomUppercase = trimmedNom?.toUpperCase();
      if (console.log("[FirestoreService Admin] Searching articles with criteria:", { code: trimmedCode, nom: trimmedNom }), !trimmedCode && !trimmedNom)
        return console.log("[FirestoreService Admin] No search criteria provided for articles."), [];
      let articlesCollection = dbAdmin.collection("articles"), resultsMap = /* @__PURE__ */ new Map();
      try {
        if (trimmedCode) {
          let codeQuery = articlesCollection.where("Code", "==", trimmedCode);
          console.log(`[FirestoreService Admin] Executing Code exact match query for: "${trimmedCode}"`);
          let codeSnapshot = await codeQuery.get();
          console.log(`[FirestoreService Admin] Code query found ${codeSnapshot.docs.length} matches.`), codeSnapshot.docs.forEach((docSnap) => {
            let data = docSnap.data();
            data.Code && data.D\u00E9signation ? resultsMap.set(docSnap.id, { id: docSnap.id, ...data }) : console.warn(`[FirestoreService Admin] Document ${docSnap.id} matched by Code is missing 'Code' or 'D\xE9signation'.`);
          });
        }
        if (nomUppercase) {
          let endTerm = nomUppercase + "\uF8FF", designationQuery = articlesCollection.orderBy("D\xE9signation").startAt(nomUppercase).endAt(endTerm);
          console.log(`[FirestoreService Admin] Executing D\xE9signation prefix query (uppercase) for: "${nomUppercase}"`);
          let designationSnapshot = await designationQuery.get();
          console.log(`[FirestoreService Admin] D\xE9signation query found ${designationSnapshot.docs.length} potential matches.`), designationSnapshot.docs.forEach((docSnap) => {
            let data = docSnap.data();
            data.Code && data.D\u00E9signation ? resultsMap.set(docSnap.id, { id: docSnap.id, ...data }) : console.warn(`[FirestoreService Admin] Document ${docSnap.id} matched by D\xE9signation is missing 'Code' or 'D\xE9signation'.`);
          });
        }
        let combinedResults = Array.from(resultsMap.values());
        return console.log(`[FirestoreService Admin] Article search completed. Found ${combinedResults.length} unique articles.`), combinedResults;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error executing article search:", error), error.code === 9 || error.code === "FAILED_PRECONDITION" ? (console.error("[FirestoreService Admin] Firestore Error: Likely missing a composite index. Check the Firestore console error message for a link to create it. You'll likely need an index on 'D\xE9signation' (ascending)."), new Error("Erreur Firestore: Index manquant requis pour la recherche par nom (sur 'D\xE9signation'). V\xE9rifiez la console Firebase.")) : new Error(`\xC9chec de la recherche d'articles. Cause: ${error.message || error}`);
      }
    }, updateSAPTICKET = async (sectorId, ticketId, data) => {
      if (!sectorId || !ticketId || !data || Object.keys(data).length === 0)
        throw console.warn("[FirestoreService Admin] updateSAPTICKET called with invalid sectorId, ticketId, or empty data."), new Error("Identifiants de secteur/ticket ou donn\xE9es de mise \xE0 jour manquants.");
      console.log(`[FirestoreService Admin] Attempting to update ticket ${ticketId} in sector ${sectorId} with data:`, data);
      try {
        let ticketDocRef = dbAdmin.collection(sectorId).doc(ticketId), updateData = { ...data };
        "date" in updateData && delete updateData.date, await ticketDocRef.update(updateData), console.log(`[FirestoreService Admin] Successfully updated ticket ${ticketId} in sector ${sectorId}.`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error updating ticket ${ticketId} in sector ${sectorId}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? (console.error(`[FirestoreService Admin] CRITICAL: Firestore permission denied for update operation on collection '${sectorId}'. Check service account permissions and Firestore rules.`), new Error(`Permission refus\xE9e par Firestore pour la mise \xE0 jour dans le secteur ${sectorId}.`)) : error.code === 5 || error.code === "NOT_FOUND" ? (console.error(`[FirestoreService Admin] Error: Document ${ticketId} not found in collection ${sectorId}.`), new Error(`Le ticket ${ticketId} n'a pas \xE9t\xE9 trouv\xE9 dans le secteur ${sectorId}.`)) : new Error(`Impossible de mettre \xE0 jour le ticket SAP ${ticketId}. Cause: ${error.message || error}`);
      }
    }, getRecentTicketsForSectors = async (sectors, count = 5) => {
      if (!sectors || sectors.length === 0)
        return [];
      console.log(`[FirestoreService Admin] Fetching recent tickets for sectors: ${sectors.join(", ")}`);
      let ticketPromises = sectors.map(async (sector) => {
        try {
          return (await dbAdmin.collection(sector).orderBy("date", "desc").limit(count).get()).docs.map((doc2) => {
            let data = doc2.data(), parsedDate = parseFrenchDate(data.date), { correctedStatus } = correctTicketStatus(data);
            return {
              id: doc2.id,
              ...data,
              statut: correctedStatus ?? data.statut,
              secteur: sector,
              date: parsedDate
            };
          });
        } catch (error) {
          return console.error(`[FirestoreService Admin] Error fetching tickets for sector ${sector}:`, error), (error.code === 9 || error.code === "FAILED_PRECONDITION") && console.error(`[FirestoreService Admin] Index missing for ticket query in sector ${sector} (likely on 'date' desc).`), [];
        }
      });
      try {
        let allTickets = (await Promise.all(ticketPromises)).flat();
        return allTickets.sort((a, b) => b.date instanceof Date ? a.date instanceof Date ? b.date.getTime() - a.date.getTime() : 1 : -1), console.log(`[FirestoreService Admin] Found ${allTickets.length} tickets across sectors, returning top ${count}`), allTickets.slice(0, count);
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error merging ticket results:", error), new Error("Impossible de r\xE9cup\xE9rer les tickets r\xE9cents.");
      }
    }, getAllTicketsForSectorsSdk = async (sectors) => {
      if (!sectors || sectors.length === 0)
        return console.log("[FirestoreService Admin] getAllTicketsForSectorsSdk: No sectors provided, returning []."), [];
      console.log(`[FirestoreService Admin] Fetching ALL tickets (one-time) for sectors: ${sectors.join(", ")}`);
      let ticketPromises = sectors.map(async (sector) => {
        try {
          let querySnapshot = await dbAdmin.collection(sector).orderBy("date", "desc").get();
          return console.log(`[FirestoreService Admin] Fetched ${querySnapshot.size} tickets for sector ${sector}.`), querySnapshot.docs.map((doc2) => {
            let data = doc2.data(), parsedDate = parseFrenchDate(data.date), { correctedStatus } = correctTicketStatus(data);
            return {
              id: doc2.id,
              ...data,
              statut: correctedStatus ?? data.statut,
              secteur: sector,
              date: parsedDate
            };
          });
        } catch (error) {
          return console.error(`[FirestoreService Admin] Error fetching ALL tickets for sector ${sector}:`, error), (error.code === 9 || error.code === "FAILED_PRECONDITION") && console.error(`[FirestoreService Admin] Index missing for ticket query in sector ${sector} (likely on 'date' desc).`), [];
        }
      });
      try {
        let allTickets = (await Promise.all(ticketPromises)).flat();
        return allTickets.sort((a, b) => b.date instanceof Date ? a.date instanceof Date ? b.date.getTime() - a.date.getTime() : 1 : -1), console.log(`[FirestoreService Admin] Fetched a total of ${allTickets.length} tickets across all specified sectors.`), allTickets;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error merging ALL ticket results:", error), new Error("Impossible de r\xE9cup\xE9rer tous les tickets SAP pour les secteurs sp\xE9cifi\xE9s.");
      }
    }, getTotalTicketCountSdk = async (sectors) => {
      if (!sectors || sectors.length === 0)
        return console.log("[FirestoreService Admin] getTotalTicketCountSdk: No sectors provided, returning 0."), 0;
      console.log(`[FirestoreService Admin] Counting total tickets via aggregate for sectors: ${sectors.join(", ")}`);
      let countPromises = sectors.map(async (sector) => {
        try {
          let count = (await dbAdmin.collection(sector).count().get()).data().count;
          return console.log(`[FirestoreService Admin] Counted ${count} docs for sector ${sector}.`), count;
        } catch (error) {
          return console.error(`[FirestoreService Admin] Error counting tickets via aggregate for sector ${sector}:`, error), 0;
        }
      });
      try {
        let totalCount = (await Promise.all(countPromises)).reduce((sum, count) => sum + count, 0);
        return console.log(`[FirestoreService Admin] Total ticket count via aggregate across sectors: ${totalCount}`), totalCount;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error summing ticket counts from aggregate:", error), new Error("Impossible de calculer le nombre total de tickets.");
      }
    }, getAllShipments = async (userProfile) => {
      if (!userProfile)
        return console.log("[FirestoreService Admin][getAllShipments] Cannot fetch shipments, user profile is null."), [];
      console.log(`[FirestoreService Admin][getAllShipments] Fetching shipments for user: ${userProfile.uid}, Role: ${userProfile.role}`);
      let shipmentsCollectionRef = dbAdmin.collection("Envoi"), q;
      try {
        let userSectors = userProfile.secteurs ?? [];
        if (userProfile.role === "Admin")
          console.log("[FirestoreService Admin][getAllShipments] Admin user. Fetching ALL shipments."), q = shipmentsCollectionRef.orderBy("nomClient");
        else {
          if (userSectors.length === 0)
            return console.log(`[FirestoreService Admin][getAllShipments] Non-admin user ${userProfile.uid} has no assigned sectors. Returning empty list.`), [];
          console.log(`[FirestoreService Admin][getAllShipments] Non-admin user. Querying sectors: ${userSectors.join(", ")}`), q = shipmentsCollectionRef.where("secteur", "in", userSectors).orderBy("nomClient");
        }
        console.log("[FirestoreService Admin][getAllShipments] Executing query...");
        let querySnapshot = await q.get();
        return console.log(`[FirestoreService Admin][getAllShipments] Query successful. Fetched ${querySnapshot.size} documents.`), querySnapshot.docs.map((doc2) => {
          let data = doc2.data(), dateCreation = data.dateCreation instanceof Timestamp2 ? data.dateCreation.toDate() : void 0;
          return { id: doc2.id, ...data, dateCreation };
        });
      } catch (error) {
        throw console.error("[FirestoreService Admin][getAllShipments] Error fetching shipments:", error), error.code === 7 || error.code === "PERMISSION_DENIED" ? (console.error("[FirestoreService Admin][getAllShipments] CRITICAL: Firestore permission denied. Check service account permissions and Firestore rules."), new Error("Permission refus\xE9e par Firestore. V\xE9rifiez les r\xE8gles de s\xE9curit\xE9.")) : error.code === 9 || error.code === "FAILED_PRECONDITION" ? (console.error("[FirestoreService Admin][getAllShipments] CRITICAL: Firestore query requires an index. Check Firestore console."), new Error("Index Firestore manquant. V\xE9rifiez la console Firestore.")) : new Error(`Impossible de r\xE9cup\xE9rer la liste des envois. Cause: ${error.message || error}`);
      }
    }, getRecentShipmentsForSectors = async (sectors, count = 5) => {
      let fetchAllSectors = !sectors || sectors.length === 0;
      console.log(fetchAllSectors ? `[FirestoreService Admin] Fetching ${count} recent shipments across ALL sectors (Admin view).` : `[FirestoreService Admin] Fetching ${count} recent shipments for sectors: ${sectors.join(", ")}`);
      try {
        let shipmentsCollectionRef = dbAdmin.collection("Envoi"), q, baseQuery = shipmentsCollectionRef.orderBy("dateCreation", "desc").limit(count);
        if (fetchAllSectors)
          q = baseQuery;
        else if (sectors.length > 0)
          q = baseQuery.where("secteur", "in", sectors);
        else
          return console.warn("[FirestoreService Admin] getRecentShipmentsForSectors: Non-admin called with empty sectors array unexpectedly. Returning []."), [];
        let shipments = (await q.get()).docs.map((doc2) => {
          let data = doc2.data(), dateCreation = data.dateCreation instanceof Timestamp2 ? data.dateCreation.toDate() : void 0;
          return {
            id: doc2.id,
            ...data,
            dateCreation
          };
        });
        return console.log(`[FirestoreService Admin] Fetched ${shipments.length} recent shipments matching criteria.`), shipments;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error fetching recent shipments:", error), error.code === 9 || error.code === "FAILED_PRECONDITION" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index (likely on dateCreation desc). Check Firestore console."), new Error("Index Firestore manquant (probablement sur dateCreation). V\xE9rifiez la console Firestore.")) : new Error(`Impossible de r\xE9cup\xE9rer les envois r\xE9cents. Cause: ${error.message || error}`);
      }
    }, getAllShipmentsForSectors = async (sectors, isAdmin) => {
      console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Fetching ALL shipments. Admin: ${isAdmin}, Sectors: ${sectors.join(", ")}`);
      try {
        let shipmentsCollectionRef = dbAdmin.collection("Envoi"), q;
        if (isAdmin)
          console.log("[FirestoreService Admin] getAllShipmentsForSectors: Admin detected, fetching all documents."), q = shipmentsCollectionRef;
        else {
          if (!sectors || sectors.length === 0)
            return console.log("[FirestoreService Admin] getAllShipmentsForSectors: Non-admin with no sectors, returning []."), [];
          console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Non-admin, fetching for sectors: ${sectors.join(", ")}`), q = shipmentsCollectionRef.where("secteur", "in", sectors);
        }
        let shipments = (await q.get()).docs.map((doc2) => {
          let data = doc2.data(), dateCreation = data.dateCreation instanceof Timestamp2 ? data.dateCreation.toDate() : void 0;
          return { id: doc2.id, ...data, dateCreation };
        });
        return console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Fetched ${shipments.length} total shipments.`), shipments;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error fetching all shipments for sectors:", error), error.code === 9 || error.code === "FAILED_PRECONDITION" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index. Check Firestore console."), new Error("Index Firestore manquant. V\xE9rifiez la console Firestore.")) : new Error(`Impossible de r\xE9cup\xE9rer tous les envois pour les secteurs. Cause: ${error.message || error}`);
      }
    }, getDistinctClientCountFromEnvoiSdk = async (userProfile) => {
      if (!userProfile)
        return console.log("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: No user profile provided, returning 0."), 0;
      let isAdmin = userProfile.role === "Admin", userSectors = userProfile.secteurs ?? [];
      console.warn(`[FirestoreService Admin] Calculating distinct client count from 'Envoi' documents. Admin: ${isAdmin}, Sectors: ${userSectors.join(", ")}. This can be inefficient.`);
      try {
        let accessibleShipments = await getAllShipmentsForSectors(userSectors, isAdmin);
        if (console.log(`[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Fetched ${accessibleShipments.length} accessible shipments.`), accessibleShipments.length === 0)
          return console.log("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: No accessible shipments found, returning 0 distinct clients."), 0;
        let uniqueClientIdentifiers = /* @__PURE__ */ new Set();
        accessibleShipments.forEach((shipment) => {
          let clientIdentifier = null;
          shipment.codeClient && String(shipment.codeClient).trim() !== "" ? clientIdentifier = String(shipment.codeClient).trim() : shipment.nomClient && String(shipment.nomClient).trim() !== "" && (clientIdentifier = String(shipment.nomClient).trim()), clientIdentifier && uniqueClientIdentifiers.add(clientIdentifier);
        });
        let count = uniqueClientIdentifiers.size;
        return console.log(`[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Found ${count} distinct clients from accessible 'Envoi' documents.`), count;
      } catch (error) {
        throw console.error("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Error calculating distinct client count:", error), new Error("Impossible de compter les clients distincts depuis les envois.");
      }
    }, deleteShipmentSdk = async (shipmentId) => {
      if (!shipmentId)
        throw new Error("Shipment ID is required to delete.");
      console.log(`[FirestoreService Admin] Attempting to delete shipment with ID: ${shipmentId}`);
      try {
        await dbAdmin.collection("Envoi").doc(shipmentId).delete(), console.log(`[FirestoreService Admin] Successfully deleted shipment: ${shipmentId}`);
      } catch (error) {
        throw console.error(`[FirestoreService Admin] Error deleting shipment ${shipmentId}:`, error), error.code === 7 || error.code === "PERMISSION_DENIED" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied for delete operation."), new Error("Permission refus\xE9e par Firestore pour la suppression.")) : new Error(`Impossible de supprimer l'envoi. Cause: ${error.message || error}`);
      }
    }, getLatestStatsSnapshotsSdk = async (count = 1) => {
      console.log(`[FirestoreService Admin] Fetching latest ${count} stats snapshot(s) from 'dailyStatsSnapshots'...`);
      try {
        let snapshots = (await dbAdmin.collection("dailyStatsSnapshots").orderBy("timestamp", "desc").limit(count).get()).docs.map((doc2) => {
          let data = doc2.data(), timestamp = data.timestamp instanceof Timestamp2 ? data.timestamp.toDate() : data.timestamp ? new Date(data.timestamp) : /* @__PURE__ */ new Date(0);
          return {
            id: doc2.id,
            timestamp,
            totalTickets: data.totalTickets ?? 0,
            activeShipments: data.activeShipments ?? 0,
            activeClients: data.activeClients ?? 0
          };
        });
        return console.log(`[FirestoreService Admin] Fetched ${snapshots.length} snapshot(s).`), snapshots;
      } catch (error) {
        throw console.error("[FirestoreService Admin] Error fetching latest stats snapshots:", error), error.code === 9 || error.code === "FAILED_PRECONDITION" ? (console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index (likely on timestamp desc). Check Firestore console."), new Error("Index Firestore manquant (probablement sur timestamp). V\xE9rifiez la console Firestore.")) : new Error(`Impossible de r\xE9cup\xE9rer le dernier snapshot de statistiques. Cause: ${error.message || error}`);
      }
    }, GEOCODE_COLLECTION_NAME = "geocodes", getGeocodeFromCache = async (address) => {
      console.log(`[FirestoreService Admin] Getting geocode cache for address: ${address}`);
      try {
        let docSnap = await dbAdmin.collection(GEOCODE_COLLECTION_NAME).doc(address).get();
        if (docSnap.exists) {
          let data = docSnap.data();
          return console.log(`[FirestoreService Admin] Geocode cache hit for address: ${address}`), { latitude: data.latitude, longitude: data.longitude };
        } else
          return console.log(`[FirestoreService Admin] Geocode cache miss for address: ${address}`), null;
      } catch (error) {
        return console.error("[FirestoreService Admin] Error getting geocode from cache:", error), null;
      }
    }, saveGeocodeToCache = async (address, latitude, longitude) => {
      console.log(`[FirestoreService Admin] Saving geocode cache for address: ${address}`);
      try {
        let cacheDocRef = dbAdmin.collection(GEOCODE_COLLECTION_NAME).doc(address), cacheEntry = {
          latitude,
          longitude,
          timestamp: FieldValue.serverTimestamp()
        };
        await cacheDocRef.set(cacheEntry), console.log(`[FirestoreService Admin] Geocode saved to cache for address: ${address}`);
      } catch (error) {
        console.error("[FirestoreService Admin] Error saving geocode to cache:", error), (error.code === 7 || error.code === "PERMISSION_DENIED") && console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied saving geocode cache.");
      }
    };
  }
});

// app/hooks/useGeoCoding.ts
import { useState as useState10, useEffect as useEffect7, useRef as useRef3 } from "react";
import axios from "axios";
var normalizeAddress, useGeoCoding, useGeoCoding_default, init_useGeoCoding = __esm({
  "app/hooks/useGeoCoding.ts"() {
    "use strict";
    init_firestore_service_server();
    normalizeAddress = (address) => address.trim().toLowerCase().replace(/\s+/g, " "), useGeoCoding = (addresses) => {
      let [coordinatesMap, setCoordinatesMap] = useState10(/* @__PURE__ */ new Map()), [isLoading, setIsLoading] = useState10(!1), [error, setError] = useState10(null), apiKey = "b93a76ecb4b0439dbfe9e64c3c6aff07", processingRef = useRef3(/* @__PURE__ */ new Set()), addressesKey = JSON.stringify(addresses.slice().sort());
      return useEffect7(() => {
        let abortController = new AbortController(), signal = abortController.signal;
        return (async () => {
          if (!addresses || addresses.length === 0) {
            setCoordinatesMap(/* @__PURE__ */ new Map()), setIsLoading(!1), setError(null), processingRef.current.clear();
            return;
          }
          if (!apiKey) {
            console.error("OpenCage API Key is missing (hardcoded value)"), setError("API Key missing"), setIsLoading(!1);
            return;
          }
          let addressesToFetch = [], currentProcessing = /* @__PURE__ */ new Set();
          if (addresses.forEach((addr) => {
            if (!addr)
              return;
            let normalizedAddr = normalizeAddress(addr);
            !coordinatesMap.has(normalizedAddr) && !processingRef.current.has(normalizedAddr) && (addressesToFetch.push(addr), processingRef.current.add(normalizedAddr), currentProcessing.add(normalizedAddr));
          }), addressesToFetch.length === 0) {
            setIsLoading(!1);
            let currentNormalizedAddresses = new Set(addresses.map(normalizeAddress));
            processingRef.current.forEach((addr) => {
              currentNormalizedAddresses.has(addr) || processingRef.current.delete(addr);
            });
            return;
          }
          console.log(`[useGeoCoding] Batch geocoding ${addressesToFetch.length} new addresses.`), setIsLoading(!0), setError(null);
          let promises = addressesToFetch.map(async (addr) => {
            let normalizedAddr = normalizeAddress(addr);
            try {
              console.log(`[useGeoCoding] Checking cache for: "${normalizedAddr}"`);
              let cachedData = await getGeocodeFromCache(normalizedAddr);
              if (cachedData)
                return console.log(`[useGeoCoding] Cache hit for "${normalizedAddr}"`), [normalizedAddr, { lat: cachedData.latitude, lng: cachedData.longitude }];
              if (signal.aborted)
                throw new Error("Request aborted");
              console.log(`[useGeoCoding] Cache miss. Calling OpenCage API for: "${addr}"`);
              let url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(addr)}&key=${apiKey}&language=fr&pretty=1`, response = await axios.get(url, { signal });
              if (signal.aborted)
                throw new Error("Request aborted");
              if (response.data?.results?.length > 0) {
                let { lat, lng } = response.data.results[0].geometry;
                return console.log(`[useGeoCoding] Geocoded "${addr}" to:`, { lat, lng }), saveGeocodeToCache(normalizedAddr, lat, lng).catch((cacheErr) => {
                  console.error(`[useGeoCoding] Error storing geocode cache for "${normalizedAddr}":`, cacheErr);
                }), [normalizedAddr, { lat, lng }];
              } else
                return console.warn(`[useGeoCoding] No results found for address: "${addr}"`), [normalizedAddr, null];
            } catch (err) {
              if (axios.isCancel(err) || err.message && err.message.includes("aborted"))
                return console.log(`[useGeoCoding] Geocode request aborted for "${addr}"`), [normalizedAddr, null];
              console.error(`[useGeoCoding] Error geocoding address "${addr}":`, err);
              let errorMessage = "Erreur de g\xE9ocodage";
              return axios.isAxiosError(err) && (err.response ? (errorMessage = `Erreur API (${err.response.status}): ${err.response.data?.status?.message || "Erreur inconnue"}`, err.response.status === 401 || err.response.status === 403 ? errorMessage = "Cl\xE9 API invalide" : err.response.status === 402 && (errorMessage = "Quota API d\xE9pass\xE9")) : err.request && (errorMessage = "Pas de r\xE9ponse du serveur")), err.code === "permission-denied" && (errorMessage = "Permission refus\xE9e pour l'\xE9criture dans le cache de g\xE9ocodage.", console.error("Firestore permission denied. Check your security rules for the 'geocodes' collection.")), setError((prev) => prev ? `${prev} | ${errorMessage}` : errorMessage), [normalizedAddr, null];
            }
          }), results = await Promise.allSettled(promises);
          signal.aborted ? console.log("[useGeoCoding] Effect aborted, skipping state update.") : (setCoordinatesMap((prevMap) => {
            let newMap = new Map(prevMap);
            results.forEach((result) => {
              if (result.status === "fulfilled" && result.value && result.value[1] !== void 0) {
                let [normalizedAddr, coords] = result.value;
                newMap.set(normalizedAddr, coords);
              } else
                result.status === "rejected" && console.error("[useGeoCoding] Promise rejected:", result.reason);
              result.status === "fulfilled" && result.value && processingRef.current.delete(result.value[0]);
            });
            let currentNormalizedAddresses = new Set(addresses.map(normalizeAddress));
            return processingRef.current.forEach((addr) => {
              currentNormalizedAddresses.has(addr) || processingRef.current.delete(addr);
            }), newMap;
          }), setIsLoading(!1)), signal.aborted && currentProcessing.forEach((addr) => processingRef.current.delete(addr));
        })(), () => {
          console.log("[useGeoCoding] Cleanup effect"), abortController.abort();
        };
      }, [addressesKey, apiKey]), { coordinates: coordinatesMap, isLoading, error };
    }, useGeoCoding_default = useGeoCoding;
  }
});

// app/utils/kmlZones.ts
var kmlCoordsToGeoJson, kmlZones, init_kmlZones = __esm({
  "app/utils/kmlZones.ts"() {
    "use strict";
    kmlCoordsToGeoJson = (kmlCoordString) => kmlCoordString.trim().split(/\s+/).map((pair) => {
      let coords = pair.split(",");
      return [parseFloat(coords[0]), parseFloat(coords[1])];
    }).filter((coords) => !isNaN(coords[0]) && !isNaN(coords[1])), kmlZones = [
      {
        feature: {
          type: "Feature",
          properties: { name: "Baptiste" },
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            4.8836577,44.886044,0
            4.2842162,44.9924881,0
            3.8667357,44.7225929,0
            4.0644896,44.3231158,0
            4.646765,44.3034632,0
            5.4927123,44.1124911,0
            5.7151854,44.1834396,0
            5.4515135,44.405585,0
            5.836035,44.6894078,0
            5.4563201,44.7906117,0
            5.1425231,44.9652883,0
            5.0251067,44.94488,0
            4.8836577,44.886044,0
          `)
            ]
          }
        }
      },
      {
        feature: {
          type: "Feature",
          properties: { name: "julien Is\xE8re" },
          // Note: KML name has space
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            5.4712372,45.0877866,0
            5.4087525,45.2146597,0
            5.3407746,45.3460764,0
            5.3579407,45.3923861,0
            5.154007,45.5084757,0
            5.1588727,45.6134865,0
            5.0592499,45.6488118,0
            4.8024445,45.5810905,0
            4.8628693,45.5253153,0
            4.7543793,45.4535917,0
            4.7548924,45.3637067,0
            4.8045044,45.3002118,0
            4.9947052,45.3475241,0
            5.1794129,45.2518931,0
            5.1505738,45.0800295,0
            5.3819733,45.0465649,0
            5.4712372,45.0877866,0
          `)
            ]
          }
        }
      },
      {
        feature: {
          type: "Feature",
          properties: { name: "Julien" },
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            5.4607639,44.7993594,0
            5.47999,45.0836844,0
            5.3804264,45.04343,0
            5.1462803,45.0788359,0
            5.1744328,45.2507031,0
            4.9952183,45.3444058,0
            4.8029575,45.2970908,0
            4.7548924,45.3637067,0
            4.5983372,45.2912944,0
            4.4905338,45.2303966,0
            4.2852268,44.9963497,0
            4.8812351,44.8894264,0
            5.0206242,44.946315,0
            5.1435337,44.968666,0
            5.4607639,44.7993594,0
          `)
            ]
          }
        }
      },
      {
        feature: {
          type: "Feature",
          properties: { name: "Florian" },
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            5.8179481,44.7013913,0
            6.1461645,44.8612524,0
            6.3569647,44.8558986,0
            6.3260653,45.0012533,0
            6.2072756,45.0187293,0
            6.2628937,45.1254119,0
            6.1619567,45.160767,0
            6.1303705,45.4370377,0
            5.9793082,45.5852412,0
            5.8893576,45.6020577,0
            5.6256856,45.6083024,0
            5.3626999,45.878565,0
            5.2226244,45.7661144,0
            5.0722489,45.7910165,0
            5.161513,45.6990145,0
            5.0592036,45.646717,0
            5.1615684,45.610667,0
            5.1546475,45.5049321,0
            5.3668206,45.3946213,0
            5.3482813,45.3459005,0
            5.4801178,45.0890645,0
            5.4718786,44.7959962,0
            5.8179481,44.7013913,0
          `)
            ]
          }
        }
      },
      {
        feature: {
          type: "Feature",
          properties: { name: "Matthieu" },
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            5.811555,46.0055516,0
            5.8369609,45.9325323,0
            5.8778364,45.8310799,0
            5.9590929,45.8132902,0
            5.9993579,45.7506936,0
            6.1535045,45.7550725,0
            6.18921,45.7004294,0
            6.3128062,45.6889188,0
            6.5181132,45.9038709,0
            6.7158671,45.7248816,0
            6.8023845,45.7718382,0
            7.0440837,45.9277564,0
            6.894395,46.118946,0
            6.8113109,46.1322712,0
            6.8628093,46.2829067,0
            6.7934581,46.3279694,0
            6.8161174,46.4269768,0
            6.5201732,46.458678,0
            6.2269755,46.3146916,0
            6.309373,46.2468299,0
            5.9578105,46.1346504,0
            5.8294078,46.1065697,0
            5.811555,46.0055516,0
          `)
            ]
          }
        }
      },
      {
        feature: {
          type: "Feature",
          properties: { name: "Guillem" },
          geometry: {
            type: "Polygon",
            coordinates: [
              kmlCoordsToGeoJson(`
            5.8274262,45.9345997,0
            5.7704346,45.7264774,0
            5.6413453,45.6194831,0
            5.889911,45.6108379,0
            5.984668,45.5940239,0
            6.1350434,45.4458434,0
            6.1789887,45.1744565,0
            6.2696259,45.1376567,0
            6.4591401,45.0523449,0
            6.6376679,45.1095567,0
            7.1526521,45.251852,0
            7.185611,45.4053629,0
            6.807956,45.7648112,0
            6.7118256,45.7188075,0
            6.5181916,45.8968606,0
            6.3190644,45.6823611,0
            6.1831086,45.693873,0
            6.147403,45.7456476,0
            5.9935944,45.7446893,0
            5.9496491,45.8069479,0
            5.8741181,45.8241765,0
            5.8274262,45.9345997,0
          `)
            ]
          }
        }
      }
    ];
    kmlZones.forEach((zone) => {
      zone.feature.geometry.coordinates.forEach((ring) => {
        if (ring.length > 0) {
          let first = ring[0], last = ring[ring.length - 1];
          (first[0] !== last[0] || first[1] !== last[1]) && (console.warn(`[kmlZones] Polygon ring for "${zone.feature.properties.name}" was not closed. Closing it.`), ring.push(first));
        }
      });
    });
  }
});

// app/components/InteractiveMap.tsx
var InteractiveMap_exports = {};
__export(InteractiveMap_exports, {
  default: () => InteractiveMap_default
});
import React8, { useState as useState11, useMemo as useMemo6, useEffect as useEffect8, useCallback as useCallback7 } from "react";
import Map2, { Marker, Popup, Source, Layer } from "react-map-gl";
import { FontAwesomeIcon as FontAwesomeIcon10 } from "@fortawesome/react-fontawesome";
import { faSpinner as faSpinner6, faExclamationTriangle as faExclamationTriangle4, faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV18 } from "react/jsx-dev-runtime";
var MAPBOX_ACCESS_TOKEN, zoneColorMap, defaultZoneColor, defaultZoneOpacity, zoneFillPaint, zoneLinePaint, getMarkerColor, normalizeAddress2, InteractiveMap, InteractiveMap_default, init_InteractiveMap = __esm({
  "app/components/InteractiveMap.tsx"() {
    "use strict";
    init_useGeoCoding();
    init_kmlZones();
    MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2ltcGVyZnk0MDQiLCJhIjoiY201ZnFuNG5wMDBoejJpczZkNXMxNTBveCJ9.BM3MvMHuUkhQj91tQTChoQ", zoneColorMap = {
      Baptiste: { color: "#FFEA00", opacity: 0.3 },
      // Yellow
      "julien Is\xE8re": { color: "#000000", opacity: 0.3 },
      // Black
      Julien: { color: "#097138", opacity: 0.3 },
      // Green
      Florian: { color: "#E65100", opacity: 0.3 },
      // Orange
      Matthieu: { color: "#9C27B0", opacity: 0.3 },
      // Purple
      Guillem: { color: "#9FA8DA", opacity: 0.3 }
      // Light Purple/Blue
    }, defaultZoneColor = "#3388ff", defaultZoneOpacity = 0.3, zoneFillPaint = {
      "fill-color": [
        "match",
        ["get", "name"],
        // Get the 'name' property from the feature
        "Baptiste",
        zoneColorMap.Baptiste.color,
        "julien Is\xE8re",
        zoneColorMap["julien Is\xE8re"].color,
        "Julien",
        zoneColorMap.Julien.color,
        "Florian",
        zoneColorMap.Florian.color,
        "Matthieu",
        zoneColorMap.Matthieu.color,
        "Guillem",
        zoneColorMap.Guillem.color,
        defaultZoneColor
        // Default color
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], !1],
        // Check hover state
        0.5,
        // Opacity when hovered
        [
          // Opacity based on name when not hovered
          "match",
          ["get", "name"],
          "Baptiste",
          zoneColorMap.Baptiste.opacity,
          "julien Is\xE8re",
          zoneColorMap["julien Is\xE8re"].opacity,
          "Julien",
          zoneColorMap.Julien.opacity,
          "Florian",
          zoneColorMap.Florian.opacity,
          "Matthieu",
          zoneColorMap.Matthieu.opacity,
          "Guillem",
          zoneColorMap.Guillem.opacity,
          defaultZoneOpacity
          // Default opacity
        ]
      ]
    }, zoneLinePaint = {
      "line-color": [
        "match",
        ["get", "name"],
        "Baptiste",
        zoneColorMap.Baptiste.color,
        "julien Is\xE8re",
        zoneColorMap["julien Is\xE8re"].color,
        "Julien",
        zoneColorMap.Julien.color,
        "Florian",
        zoneColorMap.Florian.color,
        "Matthieu",
        zoneColorMap.Matthieu.color,
        "Guillem",
        zoneColorMap.Guillem.color,
        defaultZoneColor
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], !1],
        4,
        // Line width when hovered
        2
        // Default line width
      ],
      "line-opacity": 0.8
    }, getMarkerColor = (status) => {
      if (!status)
        return "#808080";
      let statusLower = status.toLowerCase();
      return statusLower.includes("en cours") ? "#FFA500" : statusLower.includes("ferm\xE9") ? "#4CAF50" : statusLower.includes("annul\xE9") ? "#F44336" : statusLower.includes("demande de rma") ? "#9C27B0" : statusLower.includes("nouveau") ? "#2196F3" : statusLower.includes("ouvert") ? "#FFEB3B" : "#808080";
    }, normalizeAddress2 = (address) => address.trim().toLowerCase().replace(/\s+/g, " "), InteractiveMap = ({ tickets, isLoadingTickets }) => {
      let [viewport, setViewport] = useState11({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 5.5
        // pitch, bearing, padding might be handled differently or directly on Map component in v7
      }), [mapError, setMapError] = useState11(null), [selectedTicket, setSelectedTicket] = useState11(null), [hoveredZoneId, setHoveredZoneId] = useState11(null), mapRef = React8.useRef(null), uniqueAddresses = useMemo6(() => {
        if (console.log("[InteractiveMap] Recalculating unique addresses..."), !Array.isArray(tickets))
          return [];
        let addresses = tickets.map((ticket) => ticket.adresse).filter((addr) => typeof addr == "string" && addr.trim() !== ""), uniqueSet = new Set(addresses);
        return console.log(`[InteractiveMap] Found ${uniqueSet.size} unique addresses.`), Array.from(uniqueSet);
      }, [tickets]), { coordinates: geocodedCoordinates, isLoading: isGeocoding, error: geocodingError } = useGeoCoding_default(uniqueAddresses), zonesGeoJson = useMemo6(() => (console.log("[InteractiveMap] Preparing zones GeoJSON..."), {
        type: "FeatureCollection",
        features: kmlZones.map((zone, index) => ({
          ...zone.feature,
          id: index
          // Assign a unique ID for hover state management
        }))
        // Assert type after adding id
      }), []), handleMove = useCallback7((evt) => {
        setViewport(evt.viewState);
      }, []), handleMapLoad = useCallback7(() => {
        console.log("[InteractiveMap] Map loaded."), mapRef.current && zonesGeoJson.features.length > 0 && console.log("[InteractiveMap] Map loaded, zones ready (bounds fitting skipped for simplicity).");
      }, [zonesGeoJson]), handleMouseEnterZone = useCallback7((e) => {
        if (e.features && e.features.length > 0) {
          let feature = e.features[0];
          if (feature.id !== void 0 && feature.id !== hoveredZoneId) {
            hoveredZoneId !== null && mapRef.current?.setFeatureState(
              { source: "zones-source", id: hoveredZoneId },
              { hover: !1 }
            ), setHoveredZoneId(feature.id), mapRef.current?.setFeatureState(
              { source: "zones-source", id: feature.id },
              { hover: !0 }
            );
            let mapInstance = mapRef.current?.getMap();
            mapInstance && (mapInstance.getCanvas().style.cursor = "pointer");
          }
        }
      }, [hoveredZoneId]), handleMouseLeaveZone = useCallback7(() => {
        hoveredZoneId !== null && mapRef.current?.setFeatureState(
          { source: "zones-source", id: hoveredZoneId },
          { hover: !1 }
        ), setHoveredZoneId(null);
        let mapInstance = mapRef.current?.getMap();
        mapInstance && (mapInstance.getCanvas().style.cursor = "");
      }, [hoveredZoneId]);
      useEffect8(() => {
        if (geocodingError)
          console.error("[InteractiveMap] Geocoding Error:", geocodingError), setMapError((prev) => prev ? `${prev} | Erreur G\xE9ocodage: ${geocodingError}` : `Erreur G\xE9ocodage: ${geocodingError}`);
        else if (mapError?.includes("G\xE9ocodage")) {
          let otherErrors = mapError.replace(/\|? Erreur Géocodage:.*?($|\|)/, "").trim();
          setMapError(otherErrors || null);
        }
      }, [geocodingError, mapError]);
      let ticketMarkers = useMemo6(() => !Array.isArray(tickets) || geocodedCoordinates.size === 0 ? null : (console.log(`[InteractiveMap] Rendering ${tickets.length} tickets, ${geocodedCoordinates.size} geocoded.`), tickets.map((ticket) => {
        let originalAddress = ticket.adresse;
        if (!originalAddress || typeof originalAddress != "string" || originalAddress.trim() === "")
          return null;
        let normalizedAddr = normalizeAddress2(originalAddress), coordinates = geocodedCoordinates.get(normalizedAddr);
        if (coordinates) {
          let markerColor = getMarkerColor(ticket.statut);
          return /* @__PURE__ */ jsxDEV18(
            Marker,
            {
              longitude: coordinates.lng,
              latitude: coordinates.lat,
              anchor: "center",
              onClick: (e) => {
                e.originalEvent && e.originalEvent.stopPropagation(), setSelectedTicket(ticket);
              },
              children: /* @__PURE__ */ jsxDEV18("div", { style: {
                backgroundColor: markerColor,
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                cursor: "pointer"
              } }, void 0, !1, {
                fileName: "app/components/InteractiveMap.tsx",
                lineNumber: 253,
                columnNumber: 13
              }, this)
            },
            ticket.id,
            !1,
            {
              fileName: "app/components/InteractiveMap.tsx",
              lineNumber: 238,
              columnNumber: 11
            },
            this
          );
        }
        return null;
      }).filter(Boolean)), [tickets, geocodedCoordinates]);
      return /* @__PURE__ */ jsxDEV18("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg relative min-h-[450px]", children: [
        /* @__PURE__ */ jsxDEV18("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
          /* @__PURE__ */ jsxDEV18(FontAwesomeIcon10, { icon: faMapMarkedAlt, className: "mr-2 text-jdc-yellow" }, void 0, !1, {
            fileName: "app/components/InteractiveMap.tsx",
            lineNumber: 275,
            columnNumber: 9
          }, this),
          "Carte des Tickets R\xE9cents (Mapbox)"
        ] }, void 0, !0, {
          fileName: "app/components/InteractiveMap.tsx",
          lineNumber: 274,
          columnNumber: 7
        }, this),
        (isLoadingTickets || isGeocoding && geocodedCoordinates.size === 0 && uniqueAddresses.length > 0) && /* @__PURE__ */ jsxDEV18("div", { className: "absolute inset-0 z-[500] flex items-center justify-center bg-jdc-card bg-opacity-75 rounded-lg", children: [
          /* @__PURE__ */ jsxDEV18(FontAwesomeIcon10, { icon: faSpinner6, spin: !0, className: "text-jdc-yellow text-3xl mr-2" }, void 0, !1, {
            fileName: "app/components/InteractiveMap.tsx",
            lineNumber: 282,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV18("span", { className: "text-white", children: isLoadingTickets ? "Chargement des tickets..." : "G\xE9ocodage des adresses..." }, void 0, !1, {
            fileName: "app/components/InteractiveMap.tsx",
            lineNumber: 283,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/InteractiveMap.tsx",
          lineNumber: 281,
          columnNumber: 9
        }, this),
        isGeocoding && !isLoadingTickets && /* @__PURE__ */ jsxDEV18("div", { className: "absolute top-16 right-4 z-[1000] text-jdc-yellow", title: "G\xE9ocodage en cours...", children: /* @__PURE__ */ jsxDEV18(FontAwesomeIcon10, { icon: faSpinner6, spin: !0 }, void 0, !1, {
          fileName: "app/components/InteractiveMap.tsx",
          lineNumber: 290,
          columnNumber: 11
        }, this) }, void 0, !1, {
          fileName: "app/components/InteractiveMap.tsx",
          lineNumber: 289,
          columnNumber: 9
        }, this),
        mapError && !isLoadingTickets && !isGeocoding && /* @__PURE__ */ jsxDEV18("div", { className: "absolute top-12 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-800 text-white px-4 py-2 rounded text-sm shadow-lg flex items-center", children: [
          /* @__PURE__ */ jsxDEV18(FontAwesomeIcon10, { icon: faExclamationTriangle4, className: "mr-2" }, void 0, !1, {
            fileName: "app/components/InteractiveMap.tsx",
            lineNumber: 295,
            columnNumber: 11
          }, this),
          mapError
        ] }, void 0, !0, {
          fileName: "app/components/InteractiveMap.tsx",
          lineNumber: 294,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV18(
          "div",
          {
            className: `w-full h-[450px] rounded-lg overflow-hidden ${isLoadingTickets || isGeocoding && geocodedCoordinates.size === 0 && uniqueAddresses.length > 0 ? "opacity-50" : ""}`,
            style: { backgroundColor: "#4a4a4a" },
            children: /* @__PURE__ */ jsxDEV18(
              Map2,
              {
                ref: mapRef,
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: viewport.zoom,
                onMove: handleMove,
                onLoad: handleMapLoad,
                mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
                mapStyle: "mapbox://styles/mapbox/streets-v11",
                style: { width: "100%", height: "100%" },
                onMouseEnter: handleMouseEnterZone,
                onMouseLeave: handleMouseLeaveZone,
                interactiveLayerIds: ["zones-fill-layer"],
                children: [
                  /* @__PURE__ */ jsxDEV18(Source, { id: "zones-source", type: "geojson", data: zonesGeoJson, generateId: !0, children: [
                    /* @__PURE__ */ jsxDEV18(
                      Layer,
                      {
                        id: "zones-fill-layer",
                        type: "fill",
                        source: "zones-source",
                        paint: zoneFillPaint
                      },
                      void 0,
                      !1,
                      {
                        fileName: "app/components/InteractiveMap.tsx",
                        lineNumber: 323,
                        columnNumber: 13
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV18(
                      Layer,
                      {
                        id: "zones-line-layer",
                        type: "line",
                        source: "zones-source",
                        paint: zoneLinePaint
                      },
                      void 0,
                      !1,
                      {
                        fileName: "app/components/InteractiveMap.tsx",
                        lineNumber: 329,
                        columnNumber: 13
                      },
                      this
                    )
                  ] }, void 0, !0, {
                    fileName: "app/components/InteractiveMap.tsx",
                    lineNumber: 322,
                    columnNumber: 11
                  }, this),
                  ticketMarkers,
                  selectedTicket && geocodedCoordinates.get(normalizeAddress2(selectedTicket.adresse || "")) && /* @__PURE__ */ jsxDEV18(
                    Popup,
                    {
                      longitude: geocodedCoordinates.get(normalizeAddress2(selectedTicket.adresse || "")).lng,
                      latitude: geocodedCoordinates.get(normalizeAddress2(selectedTicket.adresse || "")).lat,
                      anchor: "bottom",
                      onClose: () => setSelectedTicket(null),
                      closeOnClick: !1,
                      offset: 15,
                      children: /* @__PURE__ */ jsxDEV18("div", { children: [
                        /* @__PURE__ */ jsxDEV18("b", { children: selectedTicket.raisonSociale || "Client inconnu" }, void 0, !1, {
                          fileName: "app/components/InteractiveMap.tsx",
                          lineNumber: 351,
                          columnNumber: 17
                        }, this),
                        /* @__PURE__ */ jsxDEV18("br", {}, void 0, !1, {
                          fileName: "app/components/InteractiveMap.tsx",
                          lineNumber: 351,
                          columnNumber: 74
                        }, this),
                        selectedTicket.adresse,
                        /* @__PURE__ */ jsxDEV18("br", {}, void 0, !1, {
                          fileName: "app/components/InteractiveMap.tsx",
                          lineNumber: 352,
                          columnNumber: 41
                        }, this),
                        "Statut: ",
                        selectedTicket.statut || "Non d\xE9fini",
                        /* @__PURE__ */ jsxDEV18("br", {}, void 0, !1, {
                          fileName: "app/components/InteractiveMap.tsx",
                          lineNumber: 353,
                          columnNumber: 64
                        }, this),
                        "ID: ",
                        selectedTicket.id
                      ] }, void 0, !0, {
                        fileName: "app/components/InteractiveMap.tsx",
                        lineNumber: 350,
                        columnNumber: 15
                      }, this)
                    },
                    void 0,
                    !1,
                    {
                      fileName: "app/components/InteractiveMap.tsx",
                      lineNumber: 342,
                      columnNumber: 13
                    },
                    this
                  )
                ]
              },
              void 0,
              !0,
              {
                fileName: "app/components/InteractiveMap.tsx",
                lineNumber: 305,
                columnNumber: 9
              },
              this
            )
          },
          void 0,
          !1,
          {
            fileName: "app/components/InteractiveMap.tsx",
            lineNumber: 301,
            columnNumber: 7
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/InteractiveMap.tsx",
        lineNumber: 273,
        columnNumber: 5
      }, this);
    }, InteractiveMap_default = InteractiveMap;
  }
});

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let markup = renderToString(
    /* @__PURE__ */ jsxDEV(RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
      fileName: "app/entry.server.tsx",
      lineNumber: 12,
      columnNumber: 5
    }, this)
  );
  return responseHeaders.set("Content-Type", "text/html"), new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  ErrorBoundary: () => ErrorBoundary,
  action: () => action,
  default: () => Document,
  links: () => links,
  loader: () => loader
});
import { useEffect, useState as useState3, Suspense } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation
} from "@remix-run/react";
import { json } from "@remix-run/node";
import * as NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css?url";
import globalStylesUrl from "~/styles/global.css?url";
import tailwindStylesUrl from "~/tailwind.css?url";
import mapboxStylesUrl from "mapbox-gl/dist/mapbox-gl.css?url";

// app/components/Header.tsx
import { Fragment as Fragment2 } from "react";
import { Link as Link2, NavLink, Form } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUserCircle, faSignOutAlt, faSignInAlt, faCog, faTachometerAlt, faTicketAlt, faTruck, faSearch, faSheetPlastic, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

// app/components/ui/Button.tsx
import React from "react";
import { Link } from "@remix-run/react";
import { Fragment, jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
var baseStyles = "inline-flex items-center justify-center font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jdc-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-100 ease-in-out active:scale-95", variantStyles = {
  primary: "bg-jdc-yellow text-jdc-black hover:bg-yellow-300 focus:ring-jdc-yellow",
  secondary: "bg-jdc-card text-jdc-gray-300 border border-jdc-gray-800 hover:bg-jdc-gray-800 focus:ring-jdc-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "bg-transparent text-jdc-gray-300 hover:bg-jdc-gray-800 focus:ring-jdc-gray-400"
}, sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg"
}, Button = ({
  as = "button",
  variant = "primary",
  size = "md",
  isLoading = !1,
  disabled = !1,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}) => {
  let combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`, content = /* @__PURE__ */ jsxDEV2(Fragment, { children: [
    isLoading ? /* @__PURE__ */ jsxDEV2("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsxDEV2("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }, void 0, !1, {
        fileName: "app/components/ui/Button.tsx",
        lineNumber: 67,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV2("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }, void 0, !1, {
        fileName: "app/components/ui/Button.tsx",
        lineNumber: 68,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ui/Button.tsx",
      lineNumber: 66,
      columnNumber: 9
    }, this) : leftIcon && /* @__PURE__ */ jsxDEV2("span", { className: "mr-2 -ml-1", children: React.cloneElement(leftIcon, { className: "h-5 w-5" }) }, void 0, !1, {
      fileName: "app/components/ui/Button.tsx",
      lineNumber: 71,
      columnNumber: 21
    }, this),
    children,
    !isLoading && rightIcon && /* @__PURE__ */ jsxDEV2("span", { className: "ml-2 -mr-1", children: React.cloneElement(rightIcon, { className: "h-5 w-5" }) }, void 0, !1, {
      fileName: "app/components/ui/Button.tsx",
      lineNumber: 74,
      columnNumber: 35
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/ui/Button.tsx",
    lineNumber: 64,
    columnNumber: 5
  }, this);
  if (as === "link") {
    let { to, reloadDocument, replace, state, preventScrollReset, relative, ...restLinkProps } = props;
    return /* @__PURE__ */ jsxDEV2(
      Link,
      {
        to,
        reloadDocument,
        replace,
        state,
        preventScrollReset,
        relative,
        className: combinedClassName,
        "aria-disabled": disabled || isLoading,
        ...restLinkProps,
        children: content
      },
      void 0,
      !1,
      {
        fileName: "app/components/ui/Button.tsx",
        lineNumber: 86,
        columnNumber: 7
      },
      this
    );
  }
  let { type = "button", onClick, ...restButtonProps } = props;
  return /* @__PURE__ */ jsxDEV2(
    "button",
    {
      type,
      className: combinedClassName,
      disabled: disabled || isLoading,
      onClick,
      ...restButtonProps,
      children: content
    },
    void 0,
    !1,
    {
      fileName: "app/components/ui/Button.tsx",
      lineNumber: 107,
      columnNumber: 5
    },
    this
  );
};

// app/components/Header.tsx
import { Menu, Transition } from "@headlessui/react";
import { Fragment as Fragment3, jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
var navItems = [
  { name: "Tableau de Bord", to: "/dashboard", icon: faTachometerAlt },
  { name: "Tickets SAP", to: "/tickets-sap", icon: faTicketAlt },
  { name: "Envois CTN", to: "/envois-ctn", icon: faTruck },
  { name: "Recherche Articles", to: "/articles", icon: faSearch }
  // Removed 'Install Kezia'
], installationItems = [
  { name: "Kezia", to: "/installations/kezia", disabled: !1, icon: faSheetPlastic },
  // Added icon
  { name: "CHR", to: "#", disabled: !0, icon: faSheetPlastic },
  // Placeholder link
  { name: "HACCP", to: "#", disabled: !0, icon: faSheetPlastic },
  // Placeholder link
  { name: "Tabac", to: "#", disabled: !0, icon: faSheetPlastic }
  // Placeholder link
], adminItem = { name: "Admin", to: "/admin", icon: faCog }, JDC_LOGO_URL = "https://www.jdc.fr/images/logo_jdc_blanc.svg", Header = ({ user, profile, onToggleMobileMenu, onLoginClick, loadingAuth }) => {
  let linkActiveClass = "text-jdc-yellow", linkInactiveClass = "text-jdc-gray-300 hover:text-jdc-yellow transition-colors", menuButtonClass = `${linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`, menuItemBaseClass = "group flex w-full items-center rounded-md px-3 py-2 text-sm", showAdminLink = !loadingAuth && profile?.role?.toLowerCase() === "admin";
  return /* @__PURE__ */ jsxDEV3("header", { className: "bg-jdc-blue-dark border-b border-jdc-gray-800 py-3 px-4 md:px-6 sticky top-0 z-40", children: /* @__PURE__ */ jsxDEV3("div", { className: "flex justify-between items-center max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxDEV3("div", { className: "flex items-center space-x-4 md:space-x-6", children: [
      /* @__PURE__ */ jsxDEV3(Link2, { to: user ? "/dashboard" : "/", className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV3("img", { src: JDC_LOGO_URL, alt: "JDC Logo", className: "h-8 w-auto" }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 58,
        columnNumber: 14
      }, this) }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 57,
        columnNumber: 12
      }, this),
      /* @__PURE__ */ jsxDEV3(
        "button",
        {
          onClick: onToggleMobileMenu,
          className: "md:hidden text-jdc-gray-300 hover:text-white focus:outline-none",
          "aria-label": "Ouvrir le menu",
          children: /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faBars, size: "lg" }, void 0, !1, {
            fileName: "app/components/Header.tsx",
            lineNumber: 66,
            columnNumber: 14
          }, this)
        },
        void 0,
        !1,
        {
          fileName: "app/components/Header.tsx",
          lineNumber: 61,
          columnNumber: 12
        },
        this
      ),
      user && !loadingAuth && /* @__PURE__ */ jsxDEV3("nav", { className: "hidden md:flex space-x-6 items-center", children: [
        navItems.map((item) => /* @__PURE__ */ jsxDEV3(
          NavLink,
          {
            to: item.to,
            className: ({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`,
            prefetch: "intent",
            children: [
              /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: item.icon, className: "mr-1.5" }, void 0, !1, {
                fileName: "app/components/Header.tsx",
                lineNumber: 80,
                columnNumber: 20
              }, this),
              item.name
            ]
          },
          item.to,
          !0,
          {
            fileName: "app/components/Header.tsx",
            lineNumber: 74,
            columnNumber: 18
          },
          this
        )),
        /* @__PURE__ */ jsxDEV3(Menu, { as: "div", className: "relative inline-block text-left", children: [
          /* @__PURE__ */ jsxDEV3("div", { children: /* @__PURE__ */ jsxDEV3(Menu.Button, { className: menuButtonClass, children: [
            /* @__PURE__ */ jsxDEV3("span", { children: "Installations" }, void 0, !1, {
              fileName: "app/components/Header.tsx",
              lineNumber: 89,
              columnNumber: 22
            }, this),
            /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faChevronDown, className: "ml-1.5 h-4 w-4", "aria-hidden": "true" }, void 0, !1, {
              fileName: "app/components/Header.tsx",
              lineNumber: 90,
              columnNumber: 22
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/Header.tsx",
            lineNumber: 88,
            columnNumber: 20
          }, this) }, void 0, !1, {
            fileName: "app/components/Header.tsx",
            lineNumber: 87,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV3(
            Transition,
            {
              as: Fragment2,
              enter: "transition ease-out duration-100",
              enterFrom: "transform opacity-0 scale-95",
              enterTo: "transform opacity-100 scale-100",
              leave: "transition ease-in duration-75",
              leaveFrom: "transform opacity-100 scale-100",
              leaveTo: "transform opacity-0 scale-95",
              children: /* @__PURE__ */ jsxDEV3(Menu.Items, { className: "absolute left-0 mt-2 w-48 origin-top-left divide-y divide-jdc-gray-700 rounded-md bg-jdc-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50", children: /* @__PURE__ */ jsxDEV3("div", { className: "px-1 py-1 ", children: installationItems.map((item) => /* @__PURE__ */ jsxDEV3(Menu.Item, { disabled: item.disabled, children: ({ active, disabled }) => /* @__PURE__ */ jsxDEV3(
                NavLink,
                {
                  to: item.to,
                  className: `${menuItemBaseClass} ${active ? "bg-jdc-blue text-white" : "text-jdc-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-jdc-gray-700 hover:text-white"}`,
                  onClick: (e) => {
                    disabled && e.preventDefault();
                  },
                  "aria-disabled": disabled,
                  children: [
                    /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: item.icon, className: "mr-2 h-5 w-5", "aria-hidden": "true" }, void 0, !1, {
                      fileName: "app/components/Header.tsx",
                      lineNumber: 117,
                      columnNumber: 32
                    }, this),
                    item.name,
                    disabled && /* @__PURE__ */ jsxDEV3("span", { className: "text-xs ml-1 opacity-75", children: "(Bient\xF4t)" }, void 0, !1, {
                      fileName: "app/components/Header.tsx",
                      lineNumber: 119,
                      columnNumber: 45
                    }, this)
                  ]
                },
                void 0,
                !0,
                {
                  fileName: "app/components/Header.tsx",
                  lineNumber: 107,
                  columnNumber: 30
                },
                this
              ) }, item.name, !1, {
                fileName: "app/components/Header.tsx",
                lineNumber: 105,
                columnNumber: 26
              }, this)) }, void 0, !1, {
                fileName: "app/components/Header.tsx",
                lineNumber: 103,
                columnNumber: 22
              }, this) }, void 0, !1, {
                fileName: "app/components/Header.tsx",
                lineNumber: 102,
                columnNumber: 20
              }, this)
            },
            void 0,
            !1,
            {
              fileName: "app/components/Header.tsx",
              lineNumber: 93,
              columnNumber: 18
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/Header.tsx",
          lineNumber: 86,
          columnNumber: 16
        }, this),
        showAdminLink && /* @__PURE__ */ jsxDEV3(
          NavLink,
          {
            to: adminItem.to,
            className: ({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`,
            children: [
              /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: adminItem.icon, className: "mr-1.5" }, void 0, !1, {
                fileName: "app/components/Header.tsx",
                lineNumber: 135,
                columnNumber: 21
              }, this),
              adminItem.name
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/Header.tsx",
            lineNumber: 131,
            columnNumber: 18
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/Header.tsx",
        lineNumber: 71,
        columnNumber: 14
      }, this),
      loadingAuth && /* @__PURE__ */ jsxDEV3("div", { className: "hidden md:block text-jdc-gray-400 text-sm", children: "Chargement..." }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 142,
        columnNumber: 28
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Header.tsx",
      lineNumber: 56,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { className: "flex items-center space-x-3", children: loadingAuth ? /* @__PURE__ */ jsxDEV3("div", { className: "h-8 w-20 bg-jdc-gray-700 rounded animate-pulse" }, void 0, !1, {
      fileName: "app/components/Header.tsx",
      lineNumber: 148,
      columnNumber: 14
    }, this) : user ? /* @__PURE__ */ jsxDEV3(Fragment3, { children: [
      /* @__PURE__ */ jsxDEV3("span", { className: "text-jdc-gray-300 hidden sm:inline", title: user.email ?? "", children: [
        /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faUserCircle, className: "mr-1" }, void 0, !1, {
          fileName: "app/components/Header.tsx",
          lineNumber: 152,
          columnNumber: 17
        }, this),
        profile?.displayName || user.displayName || user.email?.split("@")[0] || "Utilisateur"
      ] }, void 0, !0, {
        fileName: "app/components/Header.tsx",
        lineNumber: 151,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV3(Form, { method: "post", action: "/logout", children: /* @__PURE__ */ jsxDEV3(Button, { type: "submit", variant: "secondary", size: "sm", title: "D\xE9connexion", children: [
        /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faSignOutAlt }, void 0, !1, {
          fileName: "app/components/Header.tsx",
          lineNumber: 157,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV3("span", { className: "sr-only sm:not-sr-only sm:ml-1", children: "D\xE9connexion" }, void 0, !1, {
          fileName: "app/components/Header.tsx",
          lineNumber: 158,
          columnNumber: 19
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/Header.tsx",
        lineNumber: 156,
        columnNumber: 17
      }, this) }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 155,
        columnNumber: 15
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Header.tsx",
      lineNumber: 150,
      columnNumber: 13
    }, this) : /* @__PURE__ */ jsxDEV3("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxDEV3(Button, { variant: "primary", size: "sm", onClick: onLoginClick, leftIcon: /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faSignInAlt }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 164,
        columnNumber: 85
      }, this), children: "Connexion" }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 164,
        columnNumber: 16
      }, this),
      /* @__PURE__ */ jsxDEV3(Form, { method: "post", action: "/auth/google", children: /* @__PURE__ */ jsxDEV3(Button, { type: "submit", variant: "secondary", size: "sm", leftIcon: /* @__PURE__ */ jsxDEV3(FontAwesomeIcon, { icon: faGoogle }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 168,
        columnNumber: 81
      }, this), children: /* @__PURE__ */ jsxDEV3("span", { className: "hidden sm:inline", children: "Google" }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 169,
        columnNumber: 22
      }, this) }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 168,
        columnNumber: 19
      }, this) }, void 0, !1, {
        fileName: "app/components/Header.tsx",
        lineNumber: 167,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Header.tsx",
      lineNumber: 163,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/components/Header.tsx",
      lineNumber: 146,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Header.tsx",
    lineNumber: 54,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/Header.tsx",
    lineNumber: 53,
    columnNumber: 5
  }, this);
};

// app/components/MobileMenu.tsx
import { Link as Link3, NavLink as NavLink2 } from "@remix-run/react";
import { FontAwesomeIcon as FontAwesomeIcon2 } from "@fortawesome/react-fontawesome";
import { faTimes, faUserCircle as faUserCircle2, faSignInAlt as faSignInAlt2, faTachometerAlt as faTachometerAlt2, faTicketAlt as faTicketAlt2, faTruck as faTruck2, faCog as faCog2 } from "@fortawesome/free-solid-svg-icons";
import { Fragment as Fragment4, jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
var navItems2 = [
  { name: "Tableau de Bord", to: "/dashboard", icon: faTachometerAlt2 },
  { name: "Tickets SAP", to: "/tickets-sap", icon: faTicketAlt2 },
  { name: "Envois CTN", to: "/envois-ctn", icon: faTruck2 }
], adminItem2 = { name: "Admin", to: "/admin", icon: faCog2 }, JDC_LOGO_URL2 = "https://www.jdc.fr/images/logo_jdc_blanc.svg", MobileMenu = ({ isOpen, onClose, user, profile, onLoginClick, loadingAuth }) => {
  let linkActiveClass = "text-jdc-yellow bg-jdc-gray-800", linkInactiveClass = "text-jdc-gray-300 hover:text-white hover:bg-jdc-gray-700", linkBaseClass = "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors", showAdminLink = !loadingAuth && profile?.role?.toLowerCase() === "admin";
  return isOpen ? /* @__PURE__ */ jsxDEV4(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden",
      onClick: onClose,
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsxDEV4(
        "div",
        {
          className: "fixed inset-y-0 left-0 w-64 bg-jdc-blue-darker shadow-xl z-50 flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxDEV4("div", { className: "flex items-center justify-between px-4 py-3 border-b border-jdc-gray-800", children: [
              /* @__PURE__ */ jsxDEV4(Link3, { to: user ? "/dashboard" : "/", onClick: onClose, children: /* @__PURE__ */ jsxDEV4("img", { src: JDC_LOGO_URL2, alt: "JDC Logo", className: "h-8 w-auto" }, void 0, !1, {
                fileName: "app/components/MobileMenu.tsx",
                lineNumber: 55,
                columnNumber: 14
              }, this) }, void 0, !1, {
                fileName: "app/components/MobileMenu.tsx",
                lineNumber: 54,
                columnNumber: 12
              }, this),
              /* @__PURE__ */ jsxDEV4(
                "button",
                {
                  onClick: onClose,
                  className: "text-jdc-gray-400 hover:text-white focus:outline-none",
                  "aria-label": "Fermer le menu",
                  children: /* @__PURE__ */ jsxDEV4(FontAwesomeIcon2, { icon: faTimes, size: "lg" }, void 0, !1, {
                    fileName: "app/components/MobileMenu.tsx",
                    lineNumber: 62,
                    columnNumber: 13
                  }, this)
                },
                void 0,
                !1,
                {
                  fileName: "app/components/MobileMenu.tsx",
                  lineNumber: 57,
                  columnNumber: 11
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 53,
              columnNumber: 9
            }, this),
            /* @__PURE__ */ jsxDEV4("nav", { className: "flex-1 px-2 py-4 space-y-1", children: loadingAuth ? /* @__PURE__ */ jsxDEV4("div", { className: "px-3 py-2 text-jdc-gray-400", children: "Chargement..." }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 69,
              columnNumber: 14
            }, this) : user ? /* @__PURE__ */ jsxDEV4(Fragment4, { children: [
              navItems2.map((item) => /* @__PURE__ */ jsxDEV4(
                NavLink2,
                {
                  to: item.to,
                  onClick: onClose,
                  className: ({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`,
                  prefetch: "intent",
                  children: [
                    /* @__PURE__ */ jsxDEV4(FontAwesomeIcon2, { icon: item.icon, className: "mr-3 h-5 w-5" }, void 0, !1, {
                      fileName: "app/components/MobileMenu.tsx",
                      lineNumber: 80,
                      columnNumber: 19
                    }, this),
                    item.name
                  ]
                },
                item.to,
                !0,
                {
                  fileName: "app/components/MobileMenu.tsx",
                  lineNumber: 73,
                  columnNumber: 17
                },
                this
              )),
              showAdminLink && /* @__PURE__ */ jsxDEV4(
                NavLink2,
                {
                  to: adminItem2.to,
                  onClick: onClose,
                  className: ({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`,
                  children: [
                    /* @__PURE__ */ jsxDEV4(FontAwesomeIcon2, { icon: adminItem2.icon, className: "mr-3 h-5 w-5" }, void 0, !1, {
                      fileName: "app/components/MobileMenu.tsx",
                      lineNumber: 92,
                      columnNumber: 19
                    }, this),
                    adminItem2.name
                  ]
                },
                void 0,
                !0,
                {
                  fileName: "app/components/MobileMenu.tsx",
                  lineNumber: 86,
                  columnNumber: 17
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 71,
              columnNumber: 13
            }, this) : /* @__PURE__ */ jsxDEV4("div", { className: "px-3 py-2 text-jdc-gray-400", children: "Veuillez vous connecter." }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 98,
              columnNumber: 13
            }, this) }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 67,
              columnNumber: 9
            }, this),
            /* @__PURE__ */ jsxDEV4("div", { className: "border-t border-jdc-gray-800 p-4", children: loadingAuth ? /* @__PURE__ */ jsxDEV4("div", { className: "h-10 bg-jdc-gray-700 rounded animate-pulse" }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 105,
              columnNumber: 14
            }, this) : user ? /* @__PURE__ */ jsxDEV4("div", { className: "space-y-3", children: /* @__PURE__ */ jsxDEV4("div", { className: "flex items-center space-x-2 text-sm text-jdc-gray-300", children: [
              /* @__PURE__ */ jsxDEV4(FontAwesomeIcon2, { icon: faUserCircle2, className: "h-6 w-6" }, void 0, !1, {
                fileName: "app/components/MobileMenu.tsx",
                lineNumber: 109,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV4("span", { className: "truncate", title: user.email ?? "", children: profile?.displayName || user.displayName || user.email?.split("@")[0] }, void 0, !1, {
                fileName: "app/components/MobileMenu.tsx",
                lineNumber: 110,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 108,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 107,
              columnNumber: 13
            }, this) : /* @__PURE__ */ jsxDEV4(Button, { variant: "primary", size: "sm", onClick: () => {
              onLoginClick(), onClose();
            }, className: "w-full", leftIcon: /* @__PURE__ */ jsxDEV4(FontAwesomeIcon2, { icon: faSignInAlt2 }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 117,
              columnNumber: 126
            }, this), children: "Connexion" }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 117,
              columnNumber: 14
            }, this) }, void 0, !1, {
              fileName: "app/components/MobileMenu.tsx",
              lineNumber: 103,
              columnNumber: 9
            }, this)
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/components/MobileMenu.tsx",
          lineNumber: 48,
          columnNumber: 7
        },
        this
      )
    },
    void 0,
    !1,
    {
      fileName: "app/components/MobileMenu.tsx",
      lineNumber: 43,
      columnNumber: 5
    },
    this
  ) : null;
};

// app/components/AuthModal.tsx
import { useState as useState2 } from "react";
import { FontAwesomeIcon as FontAwesomeIcon3 } from "@fortawesome/react-fontawesome";
import { faTimes as faTimes2, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FcGoogle } from "react-icons/fc";

// app/services/auth.service.ts
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

// app/firebase.config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
var firebaseConfig = {
  apiKey: "AIzaSyADAy8ySvJsUP5diMyR9eIUgtPFimpydcA",
  // Replace with env var process.env.REACT_APP_FIREBASE_API_KEY
  authDomain: "sap-jdc.firebaseapp.com",
  // Replace with env var
  databaseURL: "https://sap-jdc-default-rtdb.europe-west1.firebasedatabase.app",
  // Replace with env var if using RTDB
  projectId: "sap-jdc",
  // Replace with env var
  storageBucket: "sap-jdc.appspot.com",
  // Corrected based on your example
  messagingSenderId: "1079234336489",
  // Replace with env var
  appId: "1:1079234336489:web:2428621b62a393068ec278",
  // Replace with env var
  measurementId: "G-PRWSK0TEFZ"
  // Optional, replace with env var
}, app = getApps().length ? getApp() : initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);

// app/services/auth.service.ts
init_firestore_service_server();
var mapFirebaseUserToAppUser = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName
});
var signInWithGoogle = async () => {
  let provider = new GoogleAuthProvider();
  try {
    console.log("[AuthService] Attempting Google Sign-In Popup...");
    let firebaseUser = (await signInWithPopup(auth, provider)).user;
    console.log(`[AuthService] Google Sign-In successful for: ${firebaseUser.uid} (${firebaseUser.email})`);
    try {
      console.log(`[AuthService] Checking for existing Firestore profile for: ${firebaseUser.uid}`), await getUserProfileSdk(firebaseUser.uid), console.log(`[AuthService] Firestore profile found for: ${firebaseUser.uid}`);
    } catch (profileError) {
      if (profileError.message?.includes("not found") || profileError.code === "not-found") {
        console.log(`[AuthService] No Firestore profile found for ${firebaseUser.uid}. Creating one...`);
        try {
          await createUserProfileSdk(
            firebaseUser.uid,
            firebaseUser.email || `no-email-${firebaseUser.uid}@example.com`,
            // Provide fallback email if null
            firebaseUser.displayName || "Utilisateur Google",
            // Use Google display name or fallback
            "Technician"
            // Default role for new Google users
          ), console.log(`[AuthService] Firestore profile created successfully for Google user: ${firebaseUser.uid}`);
        } catch (creationError) {
          console.error(`[AuthService] CRITICAL: Failed to create Firestore profile for Google user ${firebaseUser.uid} after successful auth:`, creationError);
        }
      } else
        throw console.error(`[AuthService] Error checking Firestore profile for ${firebaseUser.uid}:`, profileError), new Error("Erreur lors de la v\xE9rification du profil utilisateur.");
    }
    return mapFirebaseUserToAppUser(firebaseUser);
  } catch (error) {
    console.error("[AuthService] Google Sign In Error:", error);
    let authError = error;
    throw authError.code === "auth/popup-closed-by-user" ? new Error("Connexion Google annul\xE9e.") : authError.code === "auth/account-exists-with-different-credential" ? new Error("Un compte existe d\xE9j\xE0 avec cet email mais avec une m\xE9thode de connexion diff\xE9rente.") : authError.code === "auth/cancelled-popup-request" ? new Error("Multiples tentatives de connexion Google d\xE9tect\xE9es. Veuillez r\xE9essayer.") : new Error("Erreur lors de la connexion avec Google. Veuillez r\xE9essayer.");
  }
};

// app/context/ToastContext.tsx
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef
} from "react";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
var ToastContext = createContext(void 0), ToastProvider = ({
  children
}) => {
  let [toasts, setToasts] = useState([]), toastIdCounter = useRef(0), addToast = useCallback((toastData) => {
    let id = (toastIdCounter.current++).toString(), message = "", type = "info", title;
    typeof toastData == "string" ? message = toastData : toastData?.message ? (message = toastData.message, title = toastData.title, type = toastData.type || "info") : (console.warn("Toast data invalide:", toastData), message = "Notification sans message", type = "warning");
    let newToast = {
      id,
      message,
      type,
      ...title && { title }
    };
    setToasts((prev) => [...prev, newToast]), setTimeout(() => {
      removeToast(id);
    }, 5e3);
  }, []), removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  return /* @__PURE__ */ jsxDEV5(ToastContext.Provider, { value: { toasts, addToast, removeToast }, children }, void 0, !1, {
    fileName: "app/context/ToastContext.tsx",
    lineNumber: 74,
    columnNumber: 5
  }, this);
}, useToast = () => {
  let context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within a ToastProvider");
  return context;
};

// app/components/AuthModal.tsx
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
var AuthModal = ({ isOpen, onClose }) => {
  let [isLoading, setIsLoading] = useState2(!1), [isGoogleLoading, setIsGoogleLoading] = useState2(!1), [error, setError] = useState2(null), { addToast } = useToast();
  if (!isOpen)
    return null;
  let handleClose = () => {
    setError(null), setIsLoading(!1), setIsGoogleLoading(!1), onClose();
  };
  return /* @__PURE__ */ jsxDEV6(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4",
      onClick: handleClose,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "auth-modal-title",
      children: /* @__PURE__ */ jsxDEV6(
        "div",
        {
          className: "bg-jdc-card p-6 md:p-8 rounded-lg shadow-xl relative w-full max-w-md",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxDEV6(
              "button",
              {
                onClick: handleClose,
                className: "absolute top-3 right-3 text-jdc-gray-400 hover:text-white focus:outline-none",
                "aria-label": "Fermer la modal",
                children: /* @__PURE__ */ jsxDEV6(FontAwesomeIcon3, { icon: faTimes2, size: "lg" }, void 0, !1, {
                  fileName: "app/components/AuthModal.tsx",
                  lineNumber: 62,
                  columnNumber: 11
                }, this)
              },
              void 0,
              !1,
              {
                fileName: "app/components/AuthModal.tsx",
                lineNumber: 57,
                columnNumber: 9
              },
              this
            ),
            /* @__PURE__ */ jsxDEV6("h2", { id: "auth-modal-title", className: "text-2xl font-semibold text-white mb-6 text-center", children: "Connexion" }, void 0, !1, {
              fileName: "app/components/AuthModal.tsx",
              lineNumber: 65,
              columnNumber: 9
            }, this),
            /* @__PURE__ */ jsxDEV6(
              Button,
              {
                variant: "secondary",
                className: "w-full mb-4 flex items-center justify-center gap-2 border border-jdc-gray-600 hover:bg-jdc-gray-700",
                onClick: async () => {
                  setIsGoogleLoading(!0), setError(null);
                  try {
                    let user = await signInWithGoogle();
                    addToast({ type: "success", message: `Connect\xE9 avec Google: ${user.displayName || user.email}` }), handleClose();
                  } catch (err) {
                    let message = err instanceof Error ? err.message : "Erreur de connexion Google.";
                    setError(message), addToast({ type: "error", message });
                  } finally {
                    setIsGoogleLoading(!1);
                  }
                },
                isLoading: isGoogleLoading,
                disabled: isLoading || isGoogleLoading,
                children: [
                  isGoogleLoading ? /* @__PURE__ */ jsxDEV6(FontAwesomeIcon3, { icon: faSpinner, spin: !0 }, void 0, !1, {
                    fileName: "app/components/AuthModal.tsx",
                    lineNumber: 78,
                    columnNumber: 17
                  }, this) : /* @__PURE__ */ jsxDEV6(FcGoogle, { size: 20 }, void 0, !1, {
                    fileName: "app/components/AuthModal.tsx",
                    lineNumber: 80,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV6("span", { children: "Se connecter avec Google" }, void 0, !1, {
                    fileName: "app/components/AuthModal.tsx",
                    lineNumber: 82,
                    columnNumber: 13
                  }, this)
                ]
              },
              void 0,
              !0,
              {
                fileName: "app/components/AuthModal.tsx",
                lineNumber: 70,
                columnNumber: 9
              },
              this
            )
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/components/AuthModal.tsx",
          lineNumber: 53,
          columnNumber: 7
        },
        this
      )
    },
    void 0,
    !1,
    {
      fileName: "app/components/AuthModal.tsx",
      lineNumber: 46,
      columnNumber: 5
    },
    this
  );
};

// app/components/Toast.tsx
import { FontAwesomeIcon as FontAwesomeIcon4 } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTimes as faTimes3
} from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV7 } from "react/jsx-dev-runtime";
var toastConfig = {
  success: {
    icon: faCheckCircle,
    bgClass: "bg-green-600",
    iconColor: "text-green-100",
    textColor: "text-green-50",
    progressClass: "bg-green-200"
  },
  error: {
    icon: faExclamationCircle,
    bgClass: "bg-red-600",
    iconColor: "text-red-100",
    textColor: "text-red-50",
    progressClass: "bg-red-200"
  },
  info: {
    icon: faInfoCircle,
    bgClass: "bg-blue-600",
    iconColor: "text-blue-100",
    textColor: "text-blue-50",
    progressClass: "bg-blue-200"
  },
  warning: {
    icon: faExclamationTriangle,
    bgClass: "bg-yellow-500",
    iconColor: "text-yellow-100",
    textColor: "text-yellow-50",
    progressClass: "bg-yellow-200"
  }
}, Toast = ({ toast, onClose }) => {
  let config = toastConfig[toast.type];
  return /* @__PURE__ */ jsxDEV7(
    "div",
    {
      className: `max-w-sm w-full ${config.bgClass} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden mb-3 transition-all duration-300 ease-in-out`,
      role: "alert",
      "aria-live": "assertive",
      "aria-atomic": "true",
      children: /* @__PURE__ */ jsxDEV7("div", { className: "p-4", children: /* @__PURE__ */ jsxDEV7("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsxDEV7("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV7(FontAwesomeIcon4, { icon: config.icon, className: `h-6 w-6 ${config.iconColor}`, "aria-hidden": "true" }, void 0, !1, {
          fileName: "app/components/Toast.tsx",
          lineNumber: 73,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/components/Toast.tsx",
          lineNumber: 72,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV7("div", { className: "ml-3 w-0 flex-1 pt-0.5", children: [
          /* @__PURE__ */ jsxDEV7("p", { className: `text-sm font-medium ${config.textColor}`, children: toast.title }, void 0, !1, {
            fileName: "app/components/Toast.tsx",
            lineNumber: 76,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV7("p", { className: `mt-1 text-sm ${config.textColor} opacity-90`, children: toast.message }, void 0, !1, {
            fileName: "app/components/Toast.tsx",
            lineNumber: 77,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/Toast.tsx",
          lineNumber: 75,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV7("div", { className: "ml-4 flex-shrink-0 flex", children: /* @__PURE__ */ jsxDEV7(
          "button",
          {
            onClick: () => onClose(toast.id),
            className: `inline-flex rounded-md ${config.bgClass} ${config.textColor} opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${toast.type}-600 focus:ring-white`,
            children: [
              /* @__PURE__ */ jsxDEV7("span", { className: "sr-only", children: "Fermer" }, void 0, !1, {
                fileName: "app/components/Toast.tsx",
                lineNumber: 84,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV7(FontAwesomeIcon4, { icon: faTimes3, className: "h-5 w-5", "aria-hidden": "true" }, void 0, !1, {
                fileName: "app/components/Toast.tsx",
                lineNumber: 85,
                columnNumber: 15
              }, this)
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/Toast.tsx",
            lineNumber: 80,
            columnNumber: 13
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/Toast.tsx",
          lineNumber: 79,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/Toast.tsx",
        lineNumber: 71,
        columnNumber: 9
      }, this) }, void 0, !1, {
        fileName: "app/components/Toast.tsx",
        lineNumber: 70,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/components/Toast.tsx",
      lineNumber: 64,
      columnNumber: 5
    },
    this
  );
}, ToastContainerComponent = () => {
  let { toasts, removeToast } = useToast();
  return toasts.length ? /* @__PURE__ */ jsxDEV7("div", { className: "fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-50 space-y-3", children: toasts.map((toast) => /* @__PURE__ */ jsxDEV7(Toast, { toast, onClose: removeToast }, toast.id, !1, {
    fileName: "app/components/Toast.tsx",
    lineNumber: 105,
    columnNumber: 9
  }, this)) }, void 0, !1, {
    fileName: "app/components/Toast.tsx",
    lineNumber: 103,
    columnNumber: 5
  }, this) : null;
};
var Toast_default = ToastContainerComponent;

// app/root.tsx
import { doc, getDoc, Timestamp as Timestamp3 } from "firebase/firestore";

// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

// app/services/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("SESSION_SECRET must be set as an environment variable");
var sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    // use any name you want
    httpOnly: !0,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: !1,
    // enable this in prod
    maxAge: 60 * 60 * 24 * 30
    // 30 days
  }
}), { getSession, commitSession, destroySession } = sessionStorage;

// app/services/auth.server.ts
init_firestore_service_server();
var authenticator = new Authenticator(sessionStorage, {
  // Throw errors instead of redirecting to `/login` on failure
  throwOnError: !0
}), googleClientId = process.env.GOOGLE_CLIENT_ID, googleClientSecret = process.env.GOOGLE_CLIENT_SECRET, appBaseUrl = process.env.APP_BASE_URL;
if (!googleClientId || !googleClientSecret || !appBaseUrl)
  throw new Error(
    "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and APP_BASE_URL must be set in .env"
  );
var googleCallbackUrl = `${appBaseUrl}/auth/google/callback`;
authenticator.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      // Define the scopes needed for Google APIs
      // Ensure these scopes are enabled in your Google Cloud Console project
      scope: [
        "openid",
        // Required for OpenID Connect
        "email",
        // Get user's email address
        "profile",
        // Get user's basic profile info (name, picture)
        "https://www.googleapis.com/auth/drive",
        // Full access to Drive (adjust if needed)
        "https://www.googleapis.com/auth/calendar",
        // Full access to Calendar (adjust if needed)
        "https://www.googleapis.com/auth/gmail.modify"
        // Read/write access to Gmail (adjust if needed)
      ].join(" "),
      // Request offline access to get a refresh token
      accessType: "offline",
      // Prompt for consent every time to ensure refresh token is always sent (useful during development)
      // In production, you might remove this or set to 'auto' after the first consent
      prompt: "consent"
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      // Contains token expiry (expires_in)
      profile
      // User profile from Google
    }) => {
      console.log("[Auth Server] Google Strategy Callback triggered"), console.log("[Auth Server] Profile ID:", profile.id), console.log("[Auth Server] Profile Email:", profile.emails?.[0]?.value), console.log("[Auth Server] Access Token received:", !!accessToken), console.log("[Auth Server] Refresh Token received:", !!refreshToken);
      let email = profile.emails?.[0]?.value, displayName = profile.displayName || "Utilisateur Google", googleId = profile.id;
      if (!email)
        throw new Error("Email not found in Google profile.");
      if (!email.endsWith("@jdc.fr"))
        throw new Error("Seuls les emails @jdc.fr sont autoris\xE9s.");
      let userProfile;
      try {
        try {
          console.log(`[Auth Server] Attempting to find Firestore profile for Google ID: ${googleId}`), await getUserProfileSdk(googleId), console.log(`[Auth Server] Firestore profile found for Google ID: ${googleId}`);
        } catch (profileError) {
          if (profileError.message?.includes("not found") || profileError.code === "not-found" || profileError.message?.includes("simulation")) {
            console.log(`[Auth Server] Firestore profile for Google ID ${googleId} not found. Attempting creation...`);
            try {
              await createUserProfileSdk(
                googleId,
                // Using Google ID as the user ID here - NEEDS REVIEW/ADAPTATION
                email,
                displayName,
                "Technician"
                // Or determine role based on logic
                // Add googleId field if modifying existing structure
              ), console.log(`[Auth Server] Firestore profile created successfully for Google ID: ${googleId}`);
            } catch (creationError) {
              console.error(`[Auth Server] FAILED to create Firestore profile for Google ID ${googleId} (Email: ${email}). Error:`, creationError);
            }
          } else
            console.error(`[Auth Server] Unexpected error looking up Firestore profile for Google ID ${googleId}:`, profileError);
        }
        userProfile = {
          userId: googleId,
          // Using Google ID
          email,
          displayName,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          // Calculate expiry time (extraParams.expires_in is in seconds)
          tokenExpiry: Date.now() + extraParams.expires_in * 1e3
        };
      } catch (error) {
        throw console.error("[Auth Server] Error finding/creating user profile:", error), new Error("Failed to process user profile.");
      }
      return console.log("[Auth Server] Returning userProfile to authenticator:", userProfile), userProfile;
    }
  )
);

// app/root.tsx
import { Fragment as Fragment5, jsxDEV as jsxDEV8 } from "react/jsx-dev-runtime";
var links = () => [
  // Google Fonts - Roboto
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" },
  // App Styles
  { rel: "stylesheet", href: tailwindStylesUrl },
  { rel: "stylesheet", href: globalStylesUrl },
  { rel: "stylesheet", href: nProgressStyles },
  { rel: "stylesheet", href: mapboxStylesUrl }
  // Add Mapbox GL CSS here
], loader = async ({ request }) => {
  console.log("Root Loader: Checking authentication state via remix-auth.");
  let userSession = await authenticator.isAuthenticated(request);
  return console.log("Root Loader: Returning data:", { user: userSession }), json({ user: userSession });
}, action = async ({ request }) => {
  let action4 = (await request.formData()).get("_action");
  return console.warn("Root Action: Received unexpected action:", action4), json({ ok: !1, error: "Invalid root action" }, { status: 400 });
};
async function getClientUserProfile(userId) {
  if (!userId)
    return null;
  console.log(`[getClientUserProfile] Fetching profile client-side for ID: ${userId}`);
  try {
    let userDocRef = doc(db, "users", userId), userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      let data = userDocSnap.data(), createdAt = data.createdAt instanceof Timestamp3 ? data.createdAt.toDate() : void 0, updatedAt = data.updatedAt instanceof Timestamp3 ? data.updatedAt.toDate() : void 0;
      return console.log(`[getClientUserProfile] Profile found for ID: ${userId}`), {
        uid: userId,
        // Use the passed userId as uid
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        secteurs: data.secteurs,
        createdAt,
        updatedAt
      };
    } else
      return console.warn(`[getClientUserProfile] No profile found for ID: ${userId}`), null;
  } catch (error) {
    throw console.error(`[getClientUserProfile] Error fetching profile for ID ${userId}:`, error), new Error(`Impossible de r\xE9cup\xE9rer le profil client (ID: ${userId}).`);
  }
}
function App({ children }) {
  let { user } = useLoaderData(), location = useLocation(), navigation = useNavigation(), { addToast } = useToast(), [profile, setProfile] = useState3(null), [profileLoading, setProfileLoading] = useState3(!1), [isMobileMenuOpen, setIsMobileMenuOpen] = useState3(!1), [isAuthModalOpen, setIsAuthModalOpen] = useState3(!1);
  useEffect(() => {
    navigation.state === "idle" && !profileLoading ? NProgress.done() : NProgress.start();
  }, [navigation.state, profileLoading]), useEffect(() => {
    let isMounted = !0;
    return (async () => {
      let currentUserId = user?.userId;
      if (currentUserId) {
        console.log(`[App Effect] User session found (userId: ${currentUserId}). Fetching profile client-side...`), setProfileLoading(!0), setProfile(null);
        try {
          let clientProfile = await getClientUserProfile(currentUserId);
          isMounted && (setProfile(clientProfile), clientProfile || console.warn(`[App Effect] Profile not found client-side for userId: ${currentUserId}`));
        } catch (error) {
          console.error("[App Effect] Error fetching profile client-side:", error), isMounted && setProfile(null), addToast({ message: `Erreur chargement profil: ${error.message}`, type: "error" });
        } finally {
          isMounted && setProfileLoading(!1);
        }
      } else
        console.log("[App Effect] No user session, clearing profile."), isMounted && (setProfile(null), setProfileLoading(!1));
    })(), () => {
      isMounted = !1;
    };
  }, [user, addToast]);
  let toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen), openAuthModal = () => setIsAuthModalOpen(!0), closeAuthModal = () => setIsAuthModalOpen(!1), isDashboard = location.pathname === "/dashboard";
  return /* @__PURE__ */ jsxDEV8(Fragment5, { children: [
    /* @__PURE__ */ jsxDEV8(
      Header,
      {
        user,
        profile,
        onToggleMobileMenu: toggleMobileMenu,
        onLoginClick: openAuthModal,
        loadingAuth: navigation.state !== "idle" || profileLoading
      },
      void 0,
      !1,
      {
        fileName: "app/root.tsx",
        lineNumber: 182,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV8(
      MobileMenu,
      {
        isOpen: isMobileMenuOpen,
        onClose: toggleMobileMenu,
        user,
        profile,
        onLoginClick: openAuthModal,
        loadingAuth: navigation.state !== "idle" || profileLoading
      },
      void 0,
      !1,
      {
        fileName: "app/root.tsx",
        lineNumber: 189,
        columnNumber: 8
      },
      this
    ),
    /* @__PURE__ */ jsxDEV8(AuthModal, { isOpen: isAuthModalOpen, onClose: closeAuthModal }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 197,
      columnNumber: 8
    }, this),
    " ",
    /* @__PURE__ */ jsxDEV8("main", { className: `container mx-auto px-4 py-6 ${isDashboard ? "mt-0" : "mt-16 md:mt-20"}`, children: /* @__PURE__ */ jsxDEV8(Outlet, { context: { user, profile, profileLoading } }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 200,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 198,
      columnNumber: 8
    }, this),
    /* @__PURE__ */ jsxDEV8(Toast_default, {}, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 202,
      columnNumber: 8
    }, this),
    " "
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 181,
    columnNumber: 5
  }, this);
}
function Document() {
  return /* @__PURE__ */ jsxDEV8("html", { lang: "fr", className: "h-full bg-jdc-blue-dark", children: [
    /* @__PURE__ */ jsxDEV8("head", { children: [
      /* @__PURE__ */ jsxDEV8("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 213,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 214,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 215,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 216,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 212,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV8("body", { className: "h-full font-sans text-jdc-gray-300", children: [
      " ",
      /* @__PURE__ */ jsxDEV8(ToastProvider, { children: /* @__PURE__ */ jsxDEV8(App, { children: /* @__PURE__ */ jsxDEV8(Suspense, { fallback: /* @__PURE__ */ jsxDEV8("div", { children: "Chargement de l'application..." }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 222,
        columnNumber: 34
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 222,
        columnNumber: 14
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 221,
        columnNumber: 12
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 219,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8("div", { id: "modal-root" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 227,
        columnNumber: 9
      }, this),
      " ",
      /* @__PURE__ */ jsxDEV8(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 228,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 229,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 218,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 211,
    columnNumber: 5
  }, this);
}
function ErrorBoundary() {
  return /* @__PURE__ */ jsxDEV8("html", { lang: "fr", className: "h-full bg-jdc-blue-dark", children: [
    /* @__PURE__ */ jsxDEV8("head", { children: [
      /* @__PURE__ */ jsxDEV8("title", { children: "Oops! Une erreur est survenue" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 240,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 241,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 242,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 239,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV8("body", { className: "h-full font-sans text-white flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxDEV8("h1", { className: "text-2xl font-bold mb-4", children: "Une erreur est survenue" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 245,
        columnNumber: 10
      }, this),
      /* @__PURE__ */ jsxDEV8("p", { children: "Nous sommes d\xE9sol\xE9s, quelque chose s'est mal pass\xE9." }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 246,
        columnNumber: 10
      }, this),
      /* @__PURE__ */ jsxDEV8(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 247,
        columnNumber: 10
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 244,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 238,
    columnNumber: 5
  }, this);
}

// app/routes/auth.google.callback.ts
var auth_google_callback_exports = {};
__export(auth_google_callback_exports, {
  loader: () => loader2
});
async function loader2({ request }) {
  return authenticator.authenticate("google", request, {
    // Redirect to the dashboard upon successful authentication
    successRedirect: "/dashboard",
    // Redirect to a login or error page upon failure
    // You might want a more specific error page later
    failureRedirect: "/?error=google-auth-failed"
    // Redirect to homepage on failure
  });
}

// app/routes/installations.kezia.tsx
var installations_kezia_exports = {};
__export(installations_kezia_exports, {
  default: () => KeziaInstallations,
  loader: () => loader3
});
import { json as json2, redirect as redirect2 } from "@remix-run/node";
import { useLoaderData as useLoaderData2, Link as Link4 } from "@remix-run/react";

// app/services/google.server.ts
import { google } from "googleapis";
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET, APP_BASE_URL = process.env.APP_BASE_URL;
(!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !APP_BASE_URL) && console.error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or APP_BASE_URL in environment variables.");
var REDIRECT_URI = `${APP_BASE_URL}/auth/google/callback`;
async function getGoogleAuthClient(session) {
  if (!session?.googleAccessToken || !session.googleRefreshToken)
    throw new Error("User session or Google tokens are missing.");
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)
    throw new Error("Server Google credentials (ID or Secret) are not configured.");
  let oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  ), tokens = {
    access_token: session.googleAccessToken,
    refresh_token: session.googleRefreshToken,
    // scope: session.scopes, // Include scopes if stored in session
    token_type: "Bearer",
    expiry_date: session.tokenExpiry
  };
  if (oauth2Client.setCredentials(tokens), session.tokenExpiry && session.tokenExpiry < Date.now() + 6e4) {
    console.log("[GoogleAuthClient] Access token expired or expiring soon. Refreshing...");
    try {
      let { credentials } = await oauth2Client.refreshAccessToken();
      console.log("[GoogleAuthClient] Token refreshed successfully."), oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw console.error("[GoogleAuthClient] Error refreshing access token:", error), new Error("Failed to refresh Google access token. Please re-authenticate.");
    }
  }
  return oauth2Client;
}
async function readSheetData(authClient, spreadsheetId, range) {
  let sheets = google.sheets({ version: "v4", auth: authClient });
  console.log(`[GoogleSheets] Reading data from spreadsheetId: ${spreadsheetId}, range: ${range}`);
  try {
    let response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    return console.log(`[GoogleSheets] Successfully read data for range: ${range}`), response.data.values ?? [];
  } catch (error) {
    throw console.error(`[GoogleSheets] Error reading sheet data (ID: ${spreadsheetId}, Range: ${range}):`, error.response?.data || error.message), error.response?.status === 403 ? new Error(`Permission denied for spreadsheet ${spreadsheetId}. Ensure the user granted 'drive' or 'spreadsheets' scope and has access to the sheet.`) : error.response?.status === 404 ? new Error(`Spreadsheet or sheet/range not found (ID: ${spreadsheetId}, Range: ${range}).`) : new Error(`Failed to read Google Sheet data: ${error.message}`);
  }
}
async function getCalendarEvents(authClient, timeMin, timeMax) {
  let calendar = google.calendar({ version: "v3", auth: authClient });
  console.log(`[GoogleCalendar] Fetching events from primary calendar between ${timeMin} and ${timeMax}`);
  try {
    let events = (await calendar.events.list({
      calendarId: "primary",
      // Use the primary calendar of the authenticated user
      timeMin,
      timeMax,
      singleEvents: !0,
      // Expand recurring events into single instances
      orderBy: "startTime",
      // Order events by start time
      maxResults: 50
      // Limit the number of events fetched (adjust as needed)
    })).data.items ?? [];
    return console.log(`[GoogleCalendar] Successfully fetched ${events.length} events.`), events;
  } catch (error) {
    throw console.error("[GoogleCalendar] Error fetching calendar events:", error.response?.data || error.message), error.response?.status === 403 ? new Error("Permission denied for Google Calendar. Ensure the user granted 'calendar' or 'calendar.readonly' scope.") : error.response?.status === 404 ? new Error("Primary calendar not found.") : new Error(`Failed to fetch Google Calendar events: ${error.message}`);
  }
}

// app/routes/installations.kezia.tsx
import { useState as useState4 } from "react";
import { jsxDEV as jsxDEV9 } from "react/jsx-dev-runtime";
var KEZIA_SPREADSHEET_ID = "1uzzHN8tzc53mOOpH8WuXJHIUsk9f17eYc0qsod-Yryk", KEZIA_SHEET_NAME = "EN COURS", KEZIA_DATA_RANGE = `${KEZIA_SHEET_NAME}!A:P`;
var EDITABLE_COL_INDICES = [13, 14, 15], loader3 = async ({ request }) => {
  let session = await authenticator.isAuthenticated(request);
  if (!session)
    return redirect2("/?error=unauthenticated");
  try {
    let authClient = await getGoogleAuthClient(session), sheetValues = await readSheetData(authClient, KEZIA_SPREADSHEET_ID, KEZIA_DATA_RANGE);
    if (!sheetValues || sheetValues.length === 0)
      return json2({ headers: [], rows: [], error: "Aucune donn\xE9e trouv\xE9e dans la feuille." });
    let headers = sheetValues[0], rows = sheetValues.slice(1);
    return json2({
      headers,
      rows,
      warning: "Modification d\xE9sactiv\xE9e : Aucune colonne d'identification unique n'a \xE9t\xE9 sp\xE9cifi\xE9e pour cette feuille."
    });
  } catch (error) {
    return console.error("[installations.kezia Loader] Error:", error), error.message.includes("token") || error.message.includes("authenticate") ? redirect2("/auth/google?error=token_error") : json2({ headers: [], rows: [], error: error.message || "Erreur lors du chargement des donn\xE9es Kezia." }, { status: 500 });
  }
};
function KeziaInstallations() {
  let { headers, rows, error, warning } = useLoaderData2(), [editedData, setEditedData] = useState4({}), handleInputChange = (rowIndex, colIndex, value) => {
    setEditedData((prev) => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [colIndex]: value
      }
    }));
  }, handleSave = (rowIndex) => {
    alert(`Sauvegarde d\xE9sactiv\xE9e. Donn\xE9es modifi\xE9es pour la ligne ${rowIndex + 1}: ${JSON.stringify(editedData[rowIndex])}`);
  };
  return /* @__PURE__ */ jsxDEV9("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV9("h1", { className: "text-2xl font-semibold text-white", children: [
      "Installations Kezia (Feuille: ",
      KEZIA_SHEET_NAME,
      ")"
    ] }, void 0, !0, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 82,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV9(Link4, { to: "/dashboard", className: "text-jdc-blue hover:underline", children: "\u2190 Retour au Tableau de Bord" }, void 0, !1, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 84,
      columnNumber: 7
    }, this),
    error && /* @__PURE__ */ jsxDEV9("div", { className: "bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsxDEV9("p", { className: "font-semibold", children: "Erreur :" }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 90,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("p", { children: error }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 91,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 89,
      columnNumber: 9
    }, this),
    warning && /* @__PURE__ */ jsxDEV9("div", { className: "bg-yellow-900 bg-opacity-70 text-yellow-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsxDEV9("p", { className: "font-semibold", children: "Attention :" }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 97,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("p", { children: warning }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 98,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 96,
      columnNumber: 9
    }, this),
    !error && rows.length > 0 && /* @__PURE__ */ jsxDEV9("div", { className: "overflow-x-auto bg-jdc-card rounded-lg shadow", children: /* @__PURE__ */ jsxDEV9("table", { className: "min-w-full divide-y divide-jdc-gray-700", children: [
      /* @__PURE__ */ jsxDEV9("thead", { className: "bg-jdc-gray-800", children: /* @__PURE__ */ jsxDEV9("tr", { children: [
        /* @__PURE__ */ jsxDEV9("th", { scope: "col", className: "px-3 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider sticky left-0 bg-jdc-gray-800 z-10", children: "#" }, void 0, !1, {
          fileName: "app/routes/installations.kezia.tsx",
          lineNumber: 108,
          columnNumber: 17
        }, this),
        headers.map((header, index) => /* @__PURE__ */ jsxDEV9(
          "th",
          {
            scope: "col",
            className: `px-3 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider ${index < 1 ? "sticky left-10 bg-jdc-gray-800 z-10" : ""}`,
            children: [
              header || `Colonne ${String.fromCharCode(65 + index)}`,
              " "
            ]
          },
          index,
          !0,
          {
            fileName: "app/routes/installations.kezia.tsx",
            lineNumber: 112,
            columnNumber: 19
          },
          this
        ))
      ] }, void 0, !0, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 106,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 105,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV9("tbody", { className: "bg-jdc-card divide-y divide-jdc-gray-700", children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxDEV9("tr", { className: "hover:bg-jdc-gray-800/50", children: [
        /* @__PURE__ */ jsxDEV9("td", { className: "px-3 py-2 whitespace-nowrap text-sm text-jdc-gray-400 sticky left-0 bg-inherit z-10", children: [
          rowIndex + 2,
          " "
        ] }, void 0, !0, {
          fileName: "app/routes/installations.kezia.tsx",
          lineNumber: 130,
          columnNumber: 20
        }, this),
        row.map((cell, colIndex) => /* @__PURE__ */ jsxDEV9(
          "td",
          {
            className: `px-3 py-2 whitespace-nowrap text-sm ${colIndex < 1 ? "sticky left-10 bg-inherit z-10" : ""}`,
            children: EDITABLE_COL_INDICES.includes(colIndex) ? /* @__PURE__ */ jsxDEV9(
              "input",
              {
                type: colIndex === 14 ? "date" : "text",
                value: editedData[rowIndex]?.[colIndex] ?? cell ?? "",
                onChange: (e) => handleInputChange(rowIndex, colIndex, e.target.value),
                className: "bg-jdc-gray-700 text-white rounded px-2 py-1 w-full focus:ring-jdc-blue focus:border-jdc-blue",
                placeholder: `Modifier ${headers[colIndex] || `Col ${String.fromCharCode(65 + colIndex)}`}`
              },
              void 0,
              !1,
              {
                fileName: "app/routes/installations.kezia.tsx",
                lineNumber: 139,
                columnNumber: 25
              },
              this
            ) : /* @__PURE__ */ jsxDEV9("span", { className: "text-jdc-gray-300", children: cell }, void 0, !1, {
              fileName: "app/routes/installations.kezia.tsx",
              lineNumber: 148,
              columnNumber: 25
            }, this)
          },
          colIndex,
          !1,
          {
            fileName: "app/routes/installations.kezia.tsx",
            lineNumber: 134,
            columnNumber: 21
          },
          this
        ))
      ] }, rowIndex, !0, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 128,
        columnNumber: 17
      }, this)) }, void 0, !1, {
        fileName: "app/routes/installations.kezia.tsx",
        lineNumber: 126,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 104,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 103,
      columnNumber: 9
    }, this),
    !error && rows.length === 0 && !warning && /* @__PURE__ */ jsxDEV9("p", { className: "text-jdc-gray-400", children: "Aucune donn\xE9e \xE0 afficher." }, void 0, !1, {
      fileName: "app/routes/installations.kezia.tsx",
      lineNumber: 166,
      columnNumber: 10
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/installations.kezia.tsx",
    lineNumber: 81,
    columnNumber: 5
  }, this);
}

// app/routes/google-drive-files.tsx
var google_drive_files_exports = {};
__export(google_drive_files_exports, {
  default: () => GoogleDriveFiles,
  loader: () => loader4
});
import { json as json3, redirect as redirect3 } from "@remix-run/node";
import { useLoaderData as useLoaderData3, Link as Link5 } from "@remix-run/react";
import { jsxDEV as jsxDEV10 } from "react/jsx-dev-runtime";
var loader4 = async ({ request }) => {
  let userSession = await authenticator.isAuthenticated(request);
  if (!userSession)
    return redirect3("/?error=unauthenticated");
  let accessToken = userSession.googleAccessToken;
  if (!accessToken)
    return console.error("[google-drive-files Loader] No access token found in session."), redirect3("/auth/google?error=token_missing");
  console.log("[google-drive-files Loader] Access token found. Fetching Drive files...");
  try {
    let response = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      let errorBody = await response.json();
      if (console.error("[google-drive-files Loader] Google Drive API error:", response.status, errorBody), response.status === 401)
        return redirect3("/auth/google?error=token_invalid");
      throw new Error(`Google Drive API request failed: ${response.statusText}`);
    }
    let data = await response.json();
    return console.log(`[google-drive-files Loader] Successfully fetched ${data.files?.length ?? 0} files.`), json3({ files: data.files ?? [] });
  } catch (error) {
    return console.error("[google-drive-files Loader] Error fetching Google Drive files:", error), json3({ files: [], error: error.message || "Failed to fetch files" }, { status: 500 });
  }
};
function GoogleDriveFiles() {
  let { files, error } = useLoaderData3();
  return /* @__PURE__ */ jsxDEV10("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV10("h1", { className: "text-2xl font-semibold text-white", children: "Fichiers Google Drive (Test API)" }, void 0, !1, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 95,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV10(Link5, { to: "/dashboard", className: "text-jdc-blue hover:underline", children: "\u2190 Retour au Tableau de Bord" }, void 0, !1, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    error && /* @__PURE__ */ jsxDEV10("div", { className: "bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsxDEV10("p", { className: "font-semibold", children: "Erreur lors de la r\xE9cup\xE9ration des fichiers :" }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 103,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV10("p", { children: error }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 104,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV10("p", { className: "mt-2 text-sm", children: "Cela peut \xEAtre d\xFB \xE0 un jeton expir\xE9 ou \xE0 des permissions insuffisantes. Essayez de vous reconnecter via Google." }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 105,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV10(Link5, { to: "/auth/google", className: "text-jdc-yellow hover:underline font-semibold mt-1 block", children: "Se reconnecter avec Google" }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 106,
        columnNumber: 12
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 102,
      columnNumber: 9
    }, this),
    !error && files && files.length > 0 && /* @__PURE__ */ jsxDEV10("ul", { className: "bg-jdc-card rounded-lg shadow p-4 space-y-2", children: files.map((file) => /* @__PURE__ */ jsxDEV10("li", { className: "border-b border-jdc-gray-700 pb-2 last:border-b-0", children: [
      /* @__PURE__ */ jsxDEV10("p", { className: "font-medium text-white", children: file.name }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 116,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV10("p", { className: "text-sm text-jdc-gray-400", children: file.mimeType }, void 0, !1, {
        fileName: "app/routes/google-drive-files.tsx",
        lineNumber: 117,
        columnNumber: 15
      }, this),
      file.webViewLink && /* @__PURE__ */ jsxDEV10(
        "a",
        {
          href: file.webViewLink,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-xs text-jdc-blue hover:underline",
          children: "Ouvrir dans Drive"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/google-drive-files.tsx",
          lineNumber: 119,
          columnNumber: 17
        },
        this
      )
    ] }, file.id, !0, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 115,
      columnNumber: 13
    }, this)) }, void 0, !1, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 113,
      columnNumber: 9
    }, this),
    !error && files && files.length === 0 && /* @__PURE__ */ jsxDEV10("p", { className: "text-jdc-gray-400", children: "Aucun fichier trouv\xE9 (ou acc\xE8s non autoris\xE9)." }, void 0, !1, {
      fileName: "app/routes/google-drive-files.tsx",
      lineNumber: 134,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/google-drive-files.tsx",
    lineNumber: 94,
    columnNumber: 5
  }, this);
}

// app/routes/auth.google.ts
var auth_google_exports = {};
__export(auth_google_exports, {
  action: () => action2,
  loader: () => loader5
});
async function loader5({ request }) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard"
    // Or wherever you want authenticated users to go
  }), authenticator.authenticate("google", request);
}
async function action2({ request }) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard"
  }), authenticator.authenticate("google", request);
}

// app/routes/tickets-sap.tsx
var tickets_sap_exports = {};
__export(tickets_sap_exports, {
  default: () => TicketsSap,
  meta: () => meta
});
init_firestore_service_server();
import { useState as useState7, useEffect as useEffect4, useMemo as useMemo3, useCallback as useCallback4 } from "react";
import { useOutletContext } from "@remix-run/react";

// app/components/ui/Input.tsx
import React5, { forwardRef } from "react";
import { jsxDEV as jsxDEV11 } from "react/jsx-dev-runtime";
var Input = forwardRef(
  ({ label, id, name, type = "text", error, icon, className = "", wrapperClassName = "", ...props }, ref) => {
    let inputId = id || name, hasIcon = !!icon, baseInputStyle = "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-yellow focus:ring focus:ring-jdc-yellow focus:ring-opacity-50 placeholder-jdc-gray-400 text-white disabled:opacity-50 disabled:cursor-not-allowed", iconPadding = hasIcon ? "pl-10" : "pl-3", errorStyle = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-transparent";
    return /* @__PURE__ */ jsxDEV11("div", { className: `mb-4 ${wrapperClassName}`, children: [
      label && /* @__PURE__ */ jsxDEV11("label", { htmlFor: inputId, className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: label }, void 0, !1, {
        fileName: "app/components/ui/Input.tsx",
        lineNumber: 22,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV11("div", { className: "relative rounded-md shadow-sm", children: [
        hasIcon && /* @__PURE__ */ jsxDEV11("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: React5.cloneElement(icon, { className: `h-5 w-5 ${props.disabled ? "text-jdc-gray-500" : "text-jdc-gray-400"}` }) }, void 0, !1, {
          fileName: "app/components/ui/Input.tsx",
          lineNumber: 28,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV11(
          "input",
          {
            ref,
            type,
            id: inputId,
            name,
            className: `${baseInputStyle} ${iconPadding} pr-3 py-2 ${errorStyle} ${className}`,
            "aria-invalid": error ? "true" : "false",
            "aria-describedby": error ? `${inputId}-error` : void 0,
            ...props
          },
          void 0,
          !1,
          {
            fileName: "app/components/ui/Input.tsx",
            lineNumber: 33,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/ui/Input.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this),
      error && !props.disabled && /* @__PURE__ */ jsxDEV11("p", { className: "mt-1 text-sm text-red-500", id: `${inputId}-error`, children: error }, void 0, !1, {
        fileName: "app/components/ui/Input.tsx",
        lineNumber: 46,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ui/Input.tsx",
      lineNumber: 20,
      columnNumber: 7
    }, this);
  }
);
Input.displayName = "Input";

// app/components/TicketSAPDetails.tsx
import { useState as useState6, useEffect as useEffect3, useMemo as useMemo2, useCallback as useCallback3 } from "react";
import ReactDOM from "react-dom";

// app/hooks/useGeminiSummary.ts
import { useState as useState5, useCallback as useCallback2, useMemo } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
var useGeminiSummary = (apiKey) => {
  let [summary, setSummary] = useState5(""), [isLoading, setIsLoading] = useState5(!1), [error, setError] = useState5(null), [isCached, setIsCached] = useState5(!1), genAI = useMemo(() => {
    if (console.log("[useGeminiSummary] Initializing with API Key:", apiKey ? "Provided" : "Missing"), !apiKey)
      return null;
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (err) {
      return console.error("[useGeminiSummary] Error initializing GoogleGenerativeAI:", err), setError("Erreur d'initialisation de l'API Gemini. V\xE9rifiez la cl\xE9 API."), null;
    }
  }, [apiKey]), resetSummaryState = useCallback2(() => {
    setSummary(""), setIsLoading(!1), setError(null), setIsCached(!1);
  }, []), generateSummary = useCallback2(async (ticket, prompt, saveSummaryCallback) => {
    if (console.log("[useGeminiSummary] generateSummary called for ticket:", ticket?.id), setIsLoading(!0), setError(null), setIsCached(!1), !ticket) {
      console.warn("[useGeminiSummary] No ticket provided."), setError("Ticket non fourni."), setIsLoading(!1);
      return;
    }
    if (ticket.summary && typeof ticket.summary == "string" && ticket.summary.trim() !== "") {
      console.log(`[useGeminiSummary] Cache hit for ticket ${ticket.id}. Using existing summary.`), setSummary(ticket.summary), setIsCached(!0), setIsLoading(!1), setError(null), console.log(`[useGeminiSummary] Cache check successful for ticket ${ticket.id}. State set from cache.`);
      return;
    }
    if (console.log("[useGeminiSummary] Cache miss or summary empty. Proceeding towards API call."), setSummary(""), !prompt) {
      console.log("[useGeminiSummary] No prompt provided, skipping generation."), setError("Prompt vide fourni pour la g\xE9n\xE9ration."), setIsLoading(!1);
      return;
    }
    if (!apiKey) {
      console.error("[useGeminiSummary] Missing API Key."), setError("Cl\xE9 API Gemini manquante."), setIsLoading(!1);
      return;
    }
    if (!genAI) {
      console.error("[useGeminiSummary] genAI client not initialized. Cannot generate."), setError("Client API Gemini non initialis\xE9. V\xE9rifiez la cl\xE9 API."), setIsLoading(!1);
      return;
    }
    console.log("[useGeminiSummary] Generating with prompt:", prompt);
    try {
      let model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" }), generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048
      }, safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      ], response = (await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings
      })).response;
      if (console.log("[useGeminiSummary] Raw API Response:", response), response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let generatedText = response.candidates[0].content.parts[0].text;
        console.log("[useGeminiSummary] Generated text:", generatedText), setSummary(generatedText), setIsCached(!1);
        try {
          console.log(`[useGeminiSummary] Attempting to save generated summary for ticket ${ticket.id}...`), await saveSummaryCallback(generatedText), console.log(`[useGeminiSummary] Successfully saved summary for ticket ${ticket.id}.`);
        } catch (saveError) {
          console.error(`[useGeminiSummary] Failed to save summary for ticket ${ticket.id}:`, saveError), setError(`R\xE9sum\xE9 g\xE9n\xE9r\xE9 mais \xE9chec de la sauvegarde: ${saveError.message || "Erreur inconnue"}`);
        }
      } else {
        let blockReason = response?.promptFeedback?.blockReason, finishReason = response?.candidates?.[0]?.finishReason;
        console.warn(`[useGeminiSummary] Gemini response issue. Block Reason: ${blockReason}, Finish Reason: ${finishReason}`), setError(blockReason ? `G\xE9n\xE9ration bloqu\xE9e: ${blockReason}` : finishReason ? `G\xE9n\xE9ration termin\xE9e avec raison: ${finishReason}` : "Aucune r\xE9ponse textuelle re\xE7ue de l'IA."), setSummary("");
      }
    } catch (err) {
      console.error("[useGeminiSummary] Error generating summary with Gemini:", err), err.message?.includes("API key not valid") ? setError("Cl\xE9 API Gemini invalide ou expir\xE9e.") : err.message?.includes("SAFETY") ? setError("La g\xE9n\xE9ration a \xE9t\xE9 bloqu\xE9e pour des raisons de s\xE9curit\xE9.") : err.message?.includes("quota") ? setError("Quota d'API Gemini d\xE9pass\xE9.") : setError(`Erreur de g\xE9n\xE9ration: ${err.message || "Une erreur inconnue est survenue."}`), setSummary("");
    } finally {
      setIsLoading(!1);
    }
  }, [genAI, apiKey]);
  return { summary, isLoading, error, generateSummary, isCached, resetSummaryState };
}, useGeminiSummary_default = useGeminiSummary;

// app/components/TicketSAPDetails.tsx
init_firestore_service_server();
init_dateUtils();
import ReactMarkdown from "react-markdown";
import { FaSpinner } from "react-icons/fa";
import { jsxDEV as jsxDEV12 } from "react/jsx-dev-runtime";
var getInitialSAPStatus = (ticket) => ticket?.statutSAP ? ticket.statutSAP : "Nouveau", getSAPStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "nouveau":
      return "badge-info";
    case "en cours":
      return "badge-primary";
    case "termin\xE9":
      return "badge-success";
    case "annul\xE9":
      return "badge-error";
    default:
      return "badge-ghost";
  }
}, GEMINI_API_KEY = "AIzaSyAZqeCNWSWu1D4iFthrCW7sx9Ky2jlqoUg", TicketSAPDetails = ({ ticket, onClose, sectorId, onTicketUpdated }) => {
  let [newComment, setNewComment] = useState6(""), [currentStatus, setCurrentStatus] = useState6(""), [isUpdatingStatus, setIsUpdatingStatus] = useState6(!1), [statusUpdateError, setStatusUpdateError] = useState6(null), [commentError, setCommentError] = useState6(null), [updateError, setUpdateError] = useState6(null), [isAddingComment, setIsAddingComment] = useState6(!1), problemDescriptionForAI = ticket?.demandeSAP || ticket?.descriptionProbleme || ticket?.description || "", summaryPrompt = useMemo2(() => !problemDescriptionForAI || ticket?.summary ? "" : `R\xE9sume ce probl\xE8me SAP en 1 ou 2 phrases maximum, en fran\xE7ais: ${problemDescriptionForAI}`, [ticket?.id, problemDescriptionForAI, ticket?.summary]), {
    summary: generatedSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    generateSummary: triggerSummaryGeneration,
    isCached: isSummaryCached,
    // Get isCached state
    resetSummaryState: resetSummaryHookState
    // Get reset function
  } = useGeminiSummary_default(GEMINI_API_KEY), solutionPrompt = useMemo2(() => !problemDescriptionForAI || ticket?.solution ? "" : `Propose une solution concise (1-2 phrases), en fran\xE7ais, pour ce probl\xE8me SAP: ${problemDescriptionForAI}`, [ticket?.id, problemDescriptionForAI, ticket?.solution]), {
    summary: generatedSolution,
    isLoading: isSolutionLoading,
    error: solutionError,
    generateSummary: triggerSolutionGeneration,
    isCached: isSolutionCached,
    // Get isCached state
    resetSummaryState: resetSolutionHookState
    // Get reset function
  } = useGeminiSummary_default(GEMINI_API_KEY), handleSaveSummary = useCallback3(async (summaryToSave) => {
    if (!(!ticket || !sectorId)) {
      console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SUMMARY for ticket ${ticket.id}`), setUpdateError(null);
      try {
        await updateSAPTICKET(sectorId, ticket.id, { summary: summaryToSave }), onTicketUpdated();
      } catch (error) {
        throw console.error("Error saving SAP summary via callback:", error), setUpdateError(`Erreur sauvegarde r\xE9sum\xE9: ${error.message}`), error;
      }
    }
  }, [ticket, sectorId, onTicketUpdated]), handleSaveSolution = useCallback3(async (solutionToSave) => {
    if (!(!ticket || !sectorId)) {
      console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SOLUTION for ticket ${ticket.id}`), setUpdateError(null);
      try {
        await updateSAPTICKET(sectorId, ticket.id, { solution: solutionToSave }), onTicketUpdated();
      } catch (error) {
        throw console.error("Error saving SAP solution via callback:", error), setUpdateError(`Erreur sauvegarde solution: ${error.message}`), error;
      }
    }
  }, [ticket, sectorId, onTicketUpdated]);
  useEffect3(() => {
    console.log("[TicketSAPDetails Effect] Running for ticket:", ticket?.id), resetSummaryHookState(), resetSolutionHookState(), ticket ? (setCurrentStatus(getInitialSAPStatus(ticket)), summaryPrompt ? (console.log("[TicketSAPDetails Effect] Triggering SUMMARY generation for ticket:", ticket.id), triggerSummaryGeneration(ticket, summaryPrompt, handleSaveSummary)) : console.log("[TicketSAPDetails Effect] Skipping SUMMARY generation (prompt is empty - likely cached or no description)."), solutionPrompt ? (console.log("[TicketSAPDetails Effect] Triggering SOLUTION generation for ticket:", ticket.id), triggerSolutionGeneration(ticket, solutionPrompt, handleSaveSolution)) : console.log("[TicketSAPDetails Effect] Skipping SOLUTION generation (prompt is empty - likely cached or no description).")) : (console.log("[TicketSAPDetails Effect] No ticket, resetting status."), setCurrentStatus("")), setStatusUpdateError(null), setCommentError(null), setUpdateError(null), setNewComment("");
  }, [
    ticket,
    summaryPrompt,
    solutionPrompt,
    triggerSummaryGeneration,
    triggerSolutionGeneration,
    handleSaveSummary,
    handleSaveSolution,
    resetSummaryHookState,
    resetSolutionHookState
  ]);
  let handleClose = () => {
    resetSummaryHookState(), resetSolutionHookState(), onClose();
  }, handleAddComment = async () => {
    if (newComment.trim() && sectorId && ticket?.id) {
      setIsAddingComment(!0), setCommentError(null);
      let updatedComments = [newComment, ...ticket.commentaires || []];
      try {
        await updateSAPTICKET(sectorId, ticket.id, { commentaires: updatedComments }), setNewComment(""), onTicketUpdated();
      } catch (error) {
        setCommentError(`Erreur ajout commentaire SAP: ${error.message}`);
      } finally {
        setIsAddingComment(!1);
      }
    }
  }, handleStatusChange = async () => {
    if (sectorId && ticket?.id && currentStatus && currentStatus !== ticket?.statutSAP) {
      setIsUpdatingStatus(!0), setStatusUpdateError(null);
      try {
        await updateSAPTICKET(sectorId, ticket.id, { statutSAP: currentStatus }), onTicketUpdated();
      } catch (error) {
        setStatusUpdateError(`Erreur M\xE0J statut SAP: ${error.message}`), setCurrentStatus(getInitialSAPStatus(ticket));
      } finally {
        setIsUpdatingStatus(!1);
      }
    }
  };
  if (!ticket)
    return null;
  let displaySummary = ticket?.summary || generatedSummary, displaySolution = ticket?.solution || generatedSolution;
  console.log("[TicketSAPDetails Render] Received Ticket Prop:", JSON.stringify(ticket, null, 2)), console.log("[TicketSAPDetails Render] Calculated displaySummary:", displaySummary), console.log("[TicketSAPDetails Render] Calculated displaySolution:", displaySolution);
  let [isClient, setIsClient] = useState6(!1);
  useEffect3(() => {
    setIsClient(!0);
  }, []);
  let modalContent = (
    // Outer container: Fixed position, full screen, z-index, flex center
    // Add onClick={handleClose} to the outer div for click-outside-to-close behavior
    /* @__PURE__ */ jsxDEV12("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70", onClick: handleClose, children: /* @__PURE__ */ jsxDEV12("div", { className: "w-11/12 max-w-3xl relative bg-jdc-card text-jdc-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxDEV12(
        "button",
        {
          onClick: handleClose,
          className: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10",
          "aria-label": "Fermer",
          children: "\u2715"
        },
        void 0,
        !1,
        {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 269,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV12("h3", { className: "font-bold text-xl mb-1", children: ticket.raisonSociale || "Client Inconnu" }, void 0, !1, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 278,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("p", { className: "text-sm text-gray-400 mb-4", children: [
        "Ticket SAP: ",
        ticket.numeroSAP || "N/A"
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 279,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-4 text-sm border-t border-b border-gray-700", children: [
        /* @__PURE__ */ jsxDEV12("p", { children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "Code Client:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 283,
            columnNumber: 24
          }, this),
          " ",
          ticket.codeClient || "N/A"
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 283,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("p", { children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "T\xE9l\xE9phone:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 284,
            columnNumber: 24
          }, this),
          " ",
          ticket.telephone || "N/A"
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 284,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("p", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "Adresse:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 285,
            columnNumber: 50
          }, this),
          " ",
          ticket.adresse || "N/A"
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 285,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("p", { children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "Date Cr\xE9ation:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 287,
            columnNumber: 24
          }, this),
          " ",
          formatDateForDisplay(parseFrenchDate(ticket.date))
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 287,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("p", { children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "Secteur:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 288,
            columnNumber: 24
          }, this),
          " ",
          /* @__PURE__ */ jsxDEV12("span", { className: "badge badge-neutral", children: ticket.secteur || "N/A" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 288,
            columnNumber: 40
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 288,
          columnNumber: 21
        }, this),
        ticket.deducedSalesperson && /* @__PURE__ */ jsxDEV12("p", { children: [
          /* @__PURE__ */ jsxDEV12("b", { children: "Commercial:" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 291,
            columnNumber: 28
          }, this),
          " ",
          ticket.deducedSalesperson
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 291,
          columnNumber: 25
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 282,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("div", { className: "my-4", children: [
        /* @__PURE__ */ jsxDEV12("label", { htmlFor: "sap-ticket-status-select", className: "block text-sm font-medium text-gray-300 mb-1", children: "Statut SAP" }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 297,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV12(
            "select",
            {
              id: "sap-ticket-status-select",
              className: "select select-bordered select-sm w-full max-w-xs bg-jdc-gray text-jdc-white",
              value: currentStatus,
              onChange: (e) => setCurrentStatus(e.target.value),
              disabled: isUpdatingStatus,
              children: [
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "Nouveau", children: "Nouveau" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 308,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "En cours", children: "En cours" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 309,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "En attente client", children: "En attente client" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 310,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "R\xE9solu", children: "R\xE9solu" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 311,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "Termin\xE9", children: "Termin\xE9" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 312,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV12("option", { className: "text-black", value: "Annul\xE9", children: "Annul\xE9" }, void 0, !1, {
                  fileName: "app/components/TicketSAPDetails.tsx",
                  lineNumber: 313,
                  columnNumber: 29
                }, this)
              ]
            },
            void 0,
            !0,
            {
              fileName: "app/components/TicketSAPDetails.tsx",
              lineNumber: 299,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV12(
            "button",
            {
              className: "btn btn-primary btn-sm",
              onClick: handleStatusChange,
              disabled: isUpdatingStatus || currentStatus === ticket?.statutSAP,
              children: isUpdatingStatus ? /* @__PURE__ */ jsxDEV12(FaSpinner, { className: "animate-spin" }, void 0, !1, {
                fileName: "app/components/TicketSAPDetails.tsx",
                lineNumber: 320,
                columnNumber: 49
              }, this) : "Mettre \xE0 jour"
            },
            void 0,
            !1,
            {
              fileName: "app/components/TicketSAPDetails.tsx",
              lineNumber: 315,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV12("span", { className: `badge ${getSAPStatusBadgeClass(currentStatus)} ml-auto`, children: currentStatus }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 322,
            columnNumber: 25
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 298,
          columnNumber: 21
        }, this),
        statusUpdateError && /* @__PURE__ */ jsxDEV12("p", { className: "text-error text-xs mt-1", children: statusUpdateError }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 324,
          columnNumber: 43
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 296,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("hr", { className: "my-3 border-gray-700" }, void 0, !1, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 326,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxDEV12("div", { children: [
          /* @__PURE__ */ jsxDEV12("h4", { className: "text-md font-semibold mb-1 text-blue-300", children: [
            "R\xE9sum\xE9 IA ",
            isSummaryCached && /* @__PURE__ */ jsxDEV12("span", { className: "text-xs font-normal text-gray-400", children: "(cache)" }, void 0, !1, {
              fileName: "app/components/TicketSAPDetails.tsx",
              lineNumber: 333,
              columnNumber: 59
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 332,
            columnNumber: 25
          }, this),
          isSummaryLoading && /* @__PURE__ */ jsxDEV12("span", { className: "loading loading-dots loading-sm" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 335,
            columnNumber: 46
          }, this),
          (summaryError || updateError && updateError.includes("r\xE9sum\xE9")) && !displaySummary && /* @__PURE__ */ jsxDEV12("p", { className: "text-error text-xs", children: [
            "Erreur: ",
            summaryError || updateError
          ] }, void 0, !0, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 338,
            columnNumber: 29
          }, this),
          displaySummary ? /* @__PURE__ */ jsxDEV12("div", { className: "prose prose-sm max-w-none text-gray-300", children: /* @__PURE__ */ jsxDEV12(ReactMarkdown, { children: displaySummary }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 341,
            columnNumber: 86
          }, this) }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 341,
            columnNumber: 29
          }, this) : !isSummaryLoading && !summaryError && !(updateError && updateError.includes("r\xE9sum\xE9")) ? /* @__PURE__ */ jsxDEV12("p", { className: "text-xs text-gray-500 italic", children: "Aucun r\xE9sum\xE9." }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 343,
            columnNumber: 29
          }, this) : null
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 331,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("div", { children: [
          /* @__PURE__ */ jsxDEV12("h4", { className: "text-md font-semibold mb-1 text-green-300", children: [
            "Solution Propos\xE9e IA ",
            isSolutionCached && /* @__PURE__ */ jsxDEV12("span", { className: "text-xs font-normal text-gray-400", children: "(cache)" }, void 0, !1, {
              fileName: "app/components/TicketSAPDetails.tsx",
              lineNumber: 351,
              columnNumber: 71
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 350,
            columnNumber: 26
          }, this),
          isSolutionLoading && /* @__PURE__ */ jsxDEV12("span", { className: "loading loading-dots loading-sm" }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 353,
            columnNumber: 47
          }, this),
          (solutionError || updateError && updateError.includes("solution")) && !displaySolution && /* @__PURE__ */ jsxDEV12("p", { className: "text-error text-xs", children: [
            "Erreur: ",
            solutionError || updateError
          ] }, void 0, !0, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 356,
            columnNumber: 29
          }, this),
          displaySolution ? /* @__PURE__ */ jsxDEV12("div", { className: "prose prose-sm max-w-none text-gray-300", children: /* @__PURE__ */ jsxDEV12(ReactMarkdown, { children: displaySolution }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 359,
            columnNumber: 86
          }, this) }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 359,
            columnNumber: 29
          }, this) : !isSolutionLoading && !solutionError && !(updateError && updateError.includes("solution")) ? /* @__PURE__ */ jsxDEV12("p", { className: "text-xs text-gray-500 italic", children: "Aucune solution." }, void 0, !1, {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 361,
            columnNumber: 30
          }, this) : null
        ] }, void 0, !0, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 349,
          columnNumber: 21
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 329,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("hr", { className: "my-3 border-gray-700" }, void 0, !1, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 366,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("details", { className: "mb-3 text-sm", children: [
        /* @__PURE__ */ jsxDEV12("summary", { className: "cursor-pointer font-medium text-gray-400 hover:text-jdc-white", children: "Voir la description du probl\xE8me SAP" }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 370,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("div", { className: "mt-2 p-3 border border-gray-600 rounded bg-jdc-gray text-xs max-h-32 overflow-y-auto", children: /* @__PURE__ */ jsxDEV12("pre", { className: "whitespace-pre-wrap break-words font-mono", children: ticket.demandeSAP || ticket.descriptionProbleme || ticket.description || "N/A" }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 373,
          columnNumber: 25
        }, this) }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 371,
          columnNumber: 21
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 369,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("hr", { className: "my-3 border-gray-700" }, void 0, !1, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 376,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV12("div", { children: [
        /* @__PURE__ */ jsxDEV12("h4", { className: "text-md font-semibold mb-2", children: "Commentaires" }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 380,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12("div", { className: "max-h-40 overflow-y-auto mb-3 border border-gray-600 rounded p-3 bg-jdc-gray text-sm space-y-2", children: ticket.commentaires && ticket.commentaires.length > 0 ? ticket.commentaires.map((commentaire, index) => /* @__PURE__ */ jsxDEV12("p", { className: "border-b border-gray-700 pb-1 mb-1", children: commentaire }, index, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 384,
          columnNumber: 33
        }, this)) : /* @__PURE__ */ jsxDEV12("p", { className: "text-sm text-gray-500 italic", children: "Aucun commentaire." }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 387,
          columnNumber: 29
        }, this) }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 381,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV12(
          "textarea",
          {
            placeholder: "Ajouter un commentaire...",
            className: "textarea textarea-bordered w-full text-sm bg-jdc-gray",
            rows: 2,
            value: newComment,
            onChange: (e) => setNewComment(e.target.value),
            disabled: isAddingComment
          },
          void 0,
          !1,
          {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 390,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV12(
          "button",
          {
            className: "btn btn-secondary btn-sm mt-2",
            onClick: handleAddComment,
            disabled: isAddingComment || !newComment.trim(),
            children: isAddingComment ? /* @__PURE__ */ jsxDEV12(FaSpinner, { className: "animate-spin" }, void 0, !1, {
              fileName: "app/components/TicketSAPDetails.tsx",
              lineNumber: 403,
              columnNumber: 44
            }, this) : "Ajouter Commentaire"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TicketSAPDetails.tsx",
            lineNumber: 398,
            columnNumber: 21
          },
          this
        ),
        commentError && /* @__PURE__ */ jsxDEV12("p", { className: "text-error text-xs mt-1", children: commentError }, void 0, !1, {
          fileName: "app/components/TicketSAPDetails.tsx",
          lineNumber: 405,
          columnNumber: 38
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TicketSAPDetails.tsx",
        lineNumber: 379,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/TicketSAPDetails.tsx",
      lineNumber: 267,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/components/TicketSAPDetails.tsx",
      lineNumber: 264,
      columnNumber: 9
    }, this)
  );
  if (!isClient)
    return null;
  let portalRoot = document.getElementById("modal-root");
  return portalRoot ? ReactDOM.createPortal(modalContent, portalRoot) : (console.error("Modal root element #modal-root not found in the DOM."), null);
}, TicketSAPDetails_default = TicketSAPDetails;

// app/routes/tickets-sap.tsx
import { FontAwesomeIcon as FontAwesomeIcon5 } from "@fortawesome/react-fontawesome";
import {
  faTicket,
  faFilter,
  faSearch as faSearch2,
  faUserTag,
  faChevronDown as faChevronDown2,
  faChevronRight,
  faSpinner as faSpinner2,
  faExclamationTriangle as faExclamationTriangle2,
  faPhone,
  faMapMarkerAlt,
  faUserTie,
  faInfoCircle as faInfoCircle2,
  faCalendarAlt,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";

// app/utils/styleUtils.ts
var shipmentStatusStyles = {
  OUI: { bgColor: "bg-green-700", textColor: "text-green-100" },
  NON: { bgColor: "bg-red-700", textColor: "text-red-100" },
  DEFAULT: { bgColor: "bg-jdc-gray-700", textColor: "text-jdc-gray-200" }
};
function getShipmentStatusStyle(status) {
  let upperStatus = status?.toUpperCase();
  return upperStatus === "OUI" ? shipmentStatusStyles.OUI : upperStatus === "NON" ? shipmentStatusStyles.NON : shipmentStatusStyles.DEFAULT;
}
var ticketStatusStyles = {
  NOUVEAU: { bgColor: "bg-blue-600", textColor: "text-blue-100" },
  EN_COURS: { bgColor: "bg-yellow-600", textColor: "text-yellow-100" },
  RESOLU: { bgColor: "bg-green-600", textColor: "text-green-100" },
  FERME: { bgColor: "bg-gray-600", textColor: "text-gray-100" },
  ANNULE: { bgColor: "bg-red-600", textColor: "text-red-100" },
  EN_ATTENTE: { bgColor: "bg-purple-600", textColor: "text-purple-100" },
  DEMANDE_DE_RMA: { bgColor: "bg-purple-700", textColor: "text-purple-100" },
  // Added style for RMA
  A_CLOTUREE: { bgColor: "bg-teal-600", textColor: "text-teal-100" },
  // Added style for A Cloturee
  DEFAULT: { bgColor: "bg-jdc-gray-700", textColor: "text-jdc-gray-200" }
};
function getTicketStatusStyle(status) {
  switch (status?.toUpperCase().replace(/\s+/g, "_")) {
    case "NOUVEAU":
    case "OUVERT":
      return ticketStatusStyles.NOUVEAU;
    case "EN_COURS":
    case "EN_TRAITEMENT":
      return ticketStatusStyles.EN_COURS;
    case "RESOLU":
    case "TERMINE":
      return ticketStatusStyles.RESOLU;
    case "FERME":
    case "CLOTURE":
      return ticketStatusStyles.FERME;
    case "ANNULE":
      return ticketStatusStyles.ANNULE;
    case "EN_ATTENTE":
    case "ATTENTE_CLIENT":
      return ticketStatusStyles.EN_ATTENTE;
    case "DEMANDE_DE_RMA":
      return ticketStatusStyles.DEMANDE_DE_RMA;
    case "A_CLOTUREE":
      return ticketStatusStyles.A_CLOTUREE;
    default:
      return status && console.warn(`Unknown ticket status encountered: "${status}". Using default style.`), ticketStatusStyles.DEFAULT;
  }
}

// app/routes/tickets-sap.tsx
init_dateUtils();
import { Fragment as Fragment6, jsxDEV as jsxDEV13 } from "react/jsx-dev-runtime";
var meta = () => [{ title: "Tickets SAP | JDC Dashboard" }], groupTicketsByRaisonSociale = (tickets) => {
  let grouped = /* @__PURE__ */ new Map();
  return Array.isArray(tickets) && tickets.forEach((ticket) => {
    let raisonSociale = ticket.raisonSociale;
    if (raisonSociale) {
      let existing = grouped.get(raisonSociale);
      existing ? existing.push(ticket) : grouped.set(raisonSociale, [ticket]);
    }
  }), grouped;
};
function TicketsSap() {
  let { user, profile: initialProfile } = useOutletContext(), userProfile = initialProfile, [allTickets, setAllTickets] = useState7([]), [isLoading, setIsLoading] = useState7(!0), [error, setError] = useState7(null), [selectedSector, setSelectedSector] = useState7(""), [searchTerm, setSearchTerm] = useState7(""), [showNumberOptions, setShowNumberOptions] = useState7({}), [isModalOpen, setIsModalOpen] = useState7(!1), [selectedTicket, setSelectedTicket] = useState7(null);
  useEffect4(() => {
    let isMounted = !0;
    return (async () => {
      if (!user || !userProfile) {
        console.log("Tickets SAP: No user or profile, clearing state."), setIsLoading(!1), setAllTickets([]), setError(null);
        return;
      }
      setIsLoading(!0), setError(null), setAllTickets([]);
      try {
        let sectorsToQuery = userProfile.secteurs ?? [];
        if (sectorsToQuery.length === 0) {
          console.warn(`Tickets SAP: User ${user.userId} (Role: ${userProfile.role}) has no sectors assigned.`), setAllTickets([]), setIsLoading(!1);
          return;
        }
        console.log(`Tickets SAP: Fetching tickets for sectors: ${sectorsToQuery.join(", ")}`);
        let fetchedTickets = await getAllTicketsForSectorsSdk(sectorsToQuery);
        if (isMounted) {
          console.log(`Tickets SAP: Fetched ${fetchedTickets.length} tickets.`);
          let ticketsWithRaisonSociale = fetchedTickets.filter((t) => t.raisonSociale);
          setAllTickets(ticketsWithRaisonSociale), setIsLoading(!1), setError(null);
        }
      } catch (err) {
        isMounted && (console.error("Error fetching Tickets SAP:", err), setError(`Erreur de chargement initial: ${err.message}`), setAllTickets([]), setIsLoading(!1));
      }
    })(), () => {
      isMounted = !1, console.log("Tickets SAP: Unmounting or user changed.");
    };
  }, [user, userProfile]);
  let availableSectors = useMemo3(() => userProfile?.secteurs?.slice().sort() ?? [], [userProfile]), filteredAndGroupedTickets = useMemo3(() => {
    let filtered = allTickets;
    if (selectedSector && selectedSector !== "" && (filtered = filtered.filter((t) => t.secteur === selectedSector)), searchTerm.trim() !== "") {
      let lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (t) => t.raisonSociale && t.raisonSociale.toLowerCase().includes(lowerSearchTerm) || t.client && t.client.toLowerCase().includes(lowerSearchTerm) || t.id && t.id.toLowerCase().includes(lowerSearchTerm) || t.description && t.description.toLowerCase().includes(lowerSearchTerm) || t.statut && t.statut.toLowerCase().includes(lowerSearchTerm) || t.numeroSAP && t.numeroSAP.toLowerCase().includes(lowerSearchTerm) || t.deducedSalesperson && t.deducedSalesperson.toLowerCase().includes(lowerSearchTerm) || t.adresse && t.adresse.toLowerCase().includes(lowerSearchTerm) || t.telephone && t.telephone.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return groupTicketsByRaisonSociale(filtered);
  }, [allTickets, selectedSector, searchTerm]), clientGroups = useMemo3(() => {
    let findMostRecentDate = (tickets) => {
      let mostRecent = null;
      for (let ticket of tickets) {
        let parsedDate = parseFrenchDate(ticket.date);
        parsedDate && (!mostRecent || parsedDate.getTime() > mostRecent.getTime()) && (mostRecent = parsedDate);
      }
      return mostRecent;
    }, groupsWithDates = Array.from(filteredAndGroupedTickets.entries()).map(
      ([raisonSociale, tickets]) => ({
        raisonSociale,
        tickets,
        mostRecentDate: findMostRecentDate(tickets)
      })
    );
    return groupsWithDates.sort((a, b) => b.mostRecentDate ? a.mostRecentDate ? b.mostRecentDate.getTime() - a.mostRecentDate.getTime() : 1 : -1), groupsWithDates.map((group) => [group.raisonSociale, group.tickets]);
  }, [filteredAndGroupedTickets]), handleWebexCall = useCallback4((ticketId, phoneNumbers) => {
    phoneNumbers.length === 1 ? (window.location.href = `webexphone://call?uri=tel:${phoneNumbers[0]}`, setShowNumberOptions((prevState) => ({ ...prevState, [ticketId]: !1 }))) : phoneNumbers.length > 1 && setShowNumberOptions((prevState) => ({ ...prevState, [ticketId]: !prevState[ticketId] }));
  }, []), handleNumberSelection = useCallback4((number) => {
    window.location.href = `webexphone://call?uri=tel:${number}`;
  }, []), handleTicketClick = (ticket) => {
    console.log("Ticket clicked:", ticket), setSelectedTicket(ticket), setIsModalOpen(!0);
  }, handleCloseModal = () => {
    setIsModalOpen(!1), setSelectedTicket(null);
  }, refreshTickets = useCallback4(async () => {
    if (!(!user || !userProfile)) {
      console.log("Tickets SAP: Refreshing tickets manually..."), setIsLoading(!0);
      try {
        let sectorsToQuery = userProfile.secteurs ?? [];
        if (sectorsToQuery.length > 0) {
          let ticketsWithRaisonSociale = (await getAllTicketsForSectorsSdk(sectorsToQuery)).filter((t) => t.raisonSociale);
          setAllTickets(ticketsWithRaisonSociale);
        } else
          setAllTickets([]);
        setError(null);
      } catch (err) {
        console.error("Error refreshing tickets:", err), setError(`Erreur lors du rafra\xEEchissement: ${err.message}`);
      } finally {
        setIsLoading(!1);
      }
    }
  }, [user, userProfile]), handleTicketUpdated = () => {
    console.log("Ticket update detected from modal, manually refreshing list."), refreshTickets();
  };
  return !user && !isLoading ? /* @__PURE__ */ jsxDEV13("div", { className: "text-center text-jdc-gray-400 py-10", children: "Veuillez vous connecter pour voir les tickets SAP." }, void 0, !1, {
    fileName: "app/routes/tickets-sap.tsx",
    lineNumber: 260,
    columnNumber: 9
  }, this) : /* @__PURE__ */ jsxDEV13("div", { children: [
    /* @__PURE__ */ jsxDEV13("h1", { className: "text-2xl font-semibold text-white mb-4 flex items-center", children: [
      /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faTicket, className: "mr-3 text-jdc-blue" }, void 0, !1, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 269,
        columnNumber: 9
      }, this),
      "Gestion des Tickets SAP"
    ] }, void 0, !0, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 268,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV13("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-jdc-card rounded-lg shadow", children: [
      /* @__PURE__ */ jsxDEV13("div", { className: "col-span-1", children: [
        /* @__PURE__ */ jsxDEV13("label", { htmlFor: "sector-filter", className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
          /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faFilter, className: "mr-1" }, void 0, !1, {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 280,
            columnNumber: 13
          }, this),
          " Filtrer par Secteur"
        ] }, void 0, !0, {
          fileName: "app/routes/tickets-sap.tsx",
          lineNumber: 279,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV13(
          "select",
          {
            id: "sector-filter",
            name: "sector-filter",
            value: selectedSector,
            onChange: (e) => setSelectedSector(e.target.value),
            className: "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-blue focus:ring focus:ring-jdc-blue focus:ring-opacity-50 text-white py-2 pl-3 pr-10",
            disabled: isLoading || availableSectors.length === 0,
            children: [
              /* @__PURE__ */ jsxDEV13("option", { value: "", children: [
                "Tous les secteurs (",
                userProfile?.secteurs?.length ?? 0,
                ")"
              ] }, void 0, !0, {
                fileName: "app/routes/tickets-sap.tsx",
                lineNumber: 290,
                columnNumber: 13
              }, this),
              availableSectors.map((sector) => /* @__PURE__ */ jsxDEV13("option", { value: sector, children: sector }, sector, !1, {
                fileName: "app/routes/tickets-sap.tsx",
                lineNumber: 292,
                columnNumber: 15
              }, this))
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 282,
            columnNumber: 11
          },
          this
        ),
        availableSectors.length === 0 && !isLoading && !error && /* @__PURE__ */ jsxDEV13("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun secteur assign\xE9 \xE0 votre profil." }, void 0, !1, {
          fileName: "app/routes/tickets-sap.tsx",
          lineNumber: 296,
          columnNumber: 14
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 278,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV13("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsxDEV13(
        Input,
        {
          label: "Rechercher (Raison Sociale, Client, ID, SAP, Adresse, Vendeur...)",
          id: "search-client",
          name: "search-client",
          placeholder: "Entrez un nom, ID, mot-cl\xE9...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          icon: /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faSearch2 }, void 0, !1, {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 309,
            columnNumber: 20
          }, this),
          wrapperClassName: "mb-0",
          disabled: isLoading
        },
        void 0,
        !1,
        {
          fileName: "app/routes/tickets-sap.tsx",
          lineNumber: 302,
          columnNumber: 12
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 301,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 276,
      columnNumber: 7
    }, this),
    isLoading && /* @__PURE__ */ jsxDEV13("div", { className: "text-center text-jdc-gray-400 py-10", children: [
      /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faSpinner2, spin: !0, className: "text-2xl mr-2" }, void 0, !1, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 319,
        columnNumber: 11
      }, this),
      "Chargement des tickets... "
    ] }, void 0, !0, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 318,
      columnNumber: 9
    }, this),
    error && !isLoading && /* @__PURE__ */ jsxDEV13("div", { className: "text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg flex items-center justify-center", children: [
      /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faExclamationTriangle2, className: "mr-2" }, void 0, !1, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 327,
        columnNumber: 12
      }, this),
      error
    ] }, void 0, !0, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 326,
      columnNumber: 9
    }, this),
    !isLoading && !error && clientGroups.length === 0 && allTickets.length > 0 && /* @__PURE__ */ jsxDEV13("div", { className: "text-center text-jdc-gray-400 py-10", children: "Aucun ticket trouv\xE9 correspondant \xE0 votre recherche ou filtre (ou sans raison sociale)." }, void 0, !1, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 334,
      columnNumber: 9
    }, this),
    !isLoading && !error && allTickets.length === 0 && /* @__PURE__ */ jsxDEV13("div", { className: "text-center text-jdc-gray-400 py-10", children: userProfile?.secteurs && userProfile.secteurs.length > 0 ? "Aucun ticket SAP avec une raison sociale trouv\xE9e pour les secteurs assign\xE9s." : "Aucun ticket SAP trouv\xE9. V\xE9rifiez vos secteurs assign\xE9s ou contactez un administrateur." }, void 0, !1, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 340,
      columnNumber: 10
    }, this),
    !isLoading && !error && clientGroups.length > 0 && /* @__PURE__ */ jsxDEV13("div", { className: "space-y-3", children: clientGroups.map(([raisonSociale, clientTickets]) => /* @__PURE__ */ jsxDEV13("div", { className: "bg-jdc-card rounded-lg shadow overflow-hidden", children: /* @__PURE__ */ jsxDEV13("details", { className: "group", open: clientGroups.length < 5, children: [
      /* @__PURE__ */ jsxDEV13("summary", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors", children: [
        /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center min-w-0 mr-2", children: [
          /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faUserTag, className: "mr-3 text-jdc-gray-300 text-lg flex-shrink-0" }, void 0, !1, {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 356,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV13("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxDEV13("span", { className: "font-semibold text-white text-lg block truncate", title: raisonSociale, children: raisonSociale }, void 0, !1, {
              fileName: "app/routes/tickets-sap.tsx",
              lineNumber: 358,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV13("span", { className: "ml-0 md:ml-3 text-sm text-jdc-gray-400", children: [
              "(",
              clientTickets.length,
              " ticket",
              clientTickets.length > 1 ? "s" : "",
              ")"
            ] }, void 0, !0, {
              fileName: "app/routes/tickets-sap.tsx",
              lineNumber: 359,
              columnNumber: 25
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 357,
            columnNumber: 21
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/tickets-sap.tsx",
          lineNumber: 355,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV13(
          FontAwesomeIcon5,
          {
            icon: faChevronRight,
            className: "text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 364,
            columnNumber: 19
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 354,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV13("div", { className: "border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3", children: clientTickets.sort((a, b) => {
        let dateA = parseFrenchDate(a.date), dateB = parseFrenchDate(b.date);
        return dateB ? dateA ? dateB.getTime() - dateA.getTime() : 1 : -1;
      }).map((ticket) => {
        let statusStyle = getTicketStatusStyle(ticket.statut), parsedDate = parseFrenchDate(ticket.date), displayDate = formatDateForDisplay(parsedDate), phoneNumbersArray = ticket.telephone?.split(",").map((num) => num.trim()).filter((num) => num) || [];
        return /* @__PURE__ */ jsxDEV13(
          "div",
          {
            className: "border-b border-jdc-gray-700 pb-3 last:border-b-0 text-sm cursor-pointer hover:bg-jdc-gray-800 transition-colors duration-150 p-3 rounded",
            onClick: () => handleTicketClick(ticket),
            role: "button",
            tabIndex: 0,
            onKeyDown: (e) => {
              (e.key === "Enter" || e.key === " ") && handleTicketClick(ticket);
            },
            children: [
              /* @__PURE__ */ jsxDEV13("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-2", children: [
                /* @__PURE__ */ jsxDEV13("div", { className: "flex-1 min-w-0 mb-2 md:mb-0 md:mr-4", children: [
                  /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center mb-1", children: [
                    /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faInfoCircle2, className: "mr-2 text-jdc-blue w-4 text-center" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 395,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: "text-jdc-gray-100 font-semibold", title: `SAP: ${ticket.numeroSAP || "N/A"}`, children: ticket.numeroSAP || "N/A" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 396,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: `ml-3 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`, children: ticket.statut || "Inconnu" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 399,
                      columnNumber: 33
                    }, this)
                  ] }, void 0, !0, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 394,
                    columnNumber: 31
                  }, this),
                  /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center text-xs text-jdc-gray-400", children: [
                    /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faCalendarAlt, className: "mr-2 text-jdc-gray-500 w-4 text-center" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 404,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { children: displayDate }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 405,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: "mx-2", children: "|" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 406,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: "text-jdc-gray-500", title: `ID: ${ticket.id}`, children: [
                      "ID: ",
                      ticket.id.substring(0, 8),
                      "..."
                    ] }, void 0, !0, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 407,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: "mx-2", children: "|" }, void 0, !1, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 410,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV13("span", { className: "text-jdc-gray-500", children: [
                      "Secteur: ",
                      ticket.secteur || "N/A"
                    ] }, void 0, !0, {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 411,
                      columnNumber: 33
                    }, this)
                  ] }, void 0, !0, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 403,
                    columnNumber: 31
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 393,
                  columnNumber: 28
                }, this),
                /* @__PURE__ */ jsxDEV13("div", { className: "flex-shrink-0 relative", children: phoneNumbersArray.length > 0 && /* @__PURE__ */ jsxDEV13(Fragment6, { children: [
                  /* @__PURE__ */ jsxDEV13(
                    Button,
                    {
                      variant: "secondary",
                      size: "sm",
                      onClick: (e) => {
                        e.stopPropagation(), handleWebexCall(ticket.id, phoneNumbersArray);
                      },
                      className: "text-jdc-blue border-jdc-blue hover:bg-jdc-blue hover:text-white",
                      title: phoneNumbersArray.length === 1 ? `Appeler ${phoneNumbersArray[0]}` : "Appeler...",
                      children: [
                        /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faPhone, className: "mr-2" }, void 0, !1, {
                          fileName: "app/routes/tickets-sap.tsx",
                          lineNumber: 429,
                          columnNumber: 37
                        }, this),
                        /* @__PURE__ */ jsxDEV13("span", { children: "Appeler" }, void 0, !1, {
                          fileName: "app/routes/tickets-sap.tsx",
                          lineNumber: 430,
                          columnNumber: 37
                        }, this),
                        phoneNumbersArray.length > 1 && /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: showNumberOptions[ticket.id] ? faChevronUp : faChevronDown2, className: "ml-2" }, void 0, !1, {
                          fileName: "app/routes/tickets-sap.tsx",
                          lineNumber: 432,
                          columnNumber: 39
                        }, this)
                      ]
                    },
                    void 0,
                    !0,
                    {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 419,
                      columnNumber: 35
                    },
                    this
                  ),
                  showNumberOptions[ticket.id] && phoneNumbersArray.length > 1 && /* @__PURE__ */ jsxDEV13("div", { className: "absolute right-0 mt-2 w-48 bg-jdc-gray-800 rounded-md shadow-lg z-10 border border-jdc-gray-700", children: /* @__PURE__ */ jsxDEV13("ul", { className: "py-1", children: phoneNumbersArray.map((number, index) => /* @__PURE__ */ jsxDEV13("li", { children: /* @__PURE__ */ jsxDEV13(
                    "a",
                    {
                      href: `webexphone://call?uri=tel:${number}`,
                      onClick: (e) => {
                        e.stopPropagation(), e.preventDefault(), handleNumberSelection(number), setShowNumberOptions((prevState) => ({ ...prevState, [ticket.id]: !1 }));
                      },
                      className: "block px-4 py-2 text-sm text-jdc-gray-200 hover:bg-jdc-blue hover:text-white",
                      children: number
                    },
                    void 0,
                    !1,
                    {
                      fileName: "app/routes/tickets-sap.tsx",
                      lineNumber: 440,
                      columnNumber: 45
                    },
                    this
                  ) }, index, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 439,
                    columnNumber: 43
                  }, this)) }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 437,
                    columnNumber: 39
                  }, this) }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 436,
                    columnNumber: 37
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 418,
                  columnNumber: 33
                }, this) }, void 0, !1, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 416,
                  columnNumber: 28
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/tickets-sap.tsx",
                lineNumber: 392,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV13("div", { className: "space-y-1 text-xs", children: [
                ticket.deducedSalesperson && /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center text-jdc-gray-400", children: [
                  /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faUserTie, className: "mr-2 text-jdc-gray-500 w-4 text-center" }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 464,
                    columnNumber: 32
                  }, this),
                  /* @__PURE__ */ jsxDEV13("span", { children: ticket.deducedSalesperson }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 465,
                    columnNumber: 32
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 463,
                  columnNumber: 30
                }, this),
                ticket.adresse && /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center text-jdc-gray-400", children: [
                  /* @__PURE__ */ jsxDEV13(FontAwesomeIcon5, { icon: faMapMarkerAlt, className: "mr-2 text-jdc-gray-500 w-4 text-center" }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 470,
                    columnNumber: 32
                  }, this),
                  /* @__PURE__ */ jsxDEV13("span", { className: "truncate", title: ticket.adresse, children: ticket.adresse }, void 0, !1, {
                    fileName: "app/routes/tickets-sap.tsx",
                    lineNumber: 471,
                    columnNumber: 32
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 469,
                  columnNumber: 30
                }, this),
                ticket.description && /* @__PURE__ */ jsxDEV13("div", { className: "text-jdc-gray-300 pt-1", children: /* @__PURE__ */ jsxDEV13("p", { className: "line-clamp-2", title: ticket.description, children: ticket.description }, void 0, !1, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 476,
                  columnNumber: 32
                }, this) }, void 0, !1, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 475,
                  columnNumber: 30
                }, this),
                ticket.demandeSAP && /* @__PURE__ */ jsxDEV13("div", { className: "text-jdc-gray-500 italic pt-1", children: [
                  "Demande SAP: (",
                  ticket.demandeSAP.length > 40 ? ticket.demandeSAP.substring(0, 37) + "..." : ticket.demandeSAP,
                  ")"
                ] }, void 0, !0, {
                  fileName: "app/routes/tickets-sap.tsx",
                  lineNumber: 480,
                  columnNumber: 30
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/tickets-sap.tsx",
                lineNumber: 461,
                columnNumber: 25
              }, this)
            ]
          },
          ticket.id,
          !0,
          {
            fileName: "app/routes/tickets-sap.tsx",
            lineNumber: 384,
            columnNumber: 23
          },
          this
        );
      }) }, void 0, !1, {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 369,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 353,
      columnNumber: 15
    }, this) }, raisonSociale, !1, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 352,
      columnNumber: 13
    }, this)) }, void 0, !1, {
      fileName: "app/routes/tickets-sap.tsx",
      lineNumber: 350,
      columnNumber: 9
    }, this),
    isModalOpen && selectedTicket && /* @__PURE__ */ jsxDEV13(
      TicketSAPDetails_default,
      {
        ticket: selectedTicket,
        sectorId: selectedTicket.secteur,
        onClose: handleCloseModal,
        onTicketUpdated: handleTicketUpdated
      },
      void 0,
      !1,
      {
        fileName: "app/routes/tickets-sap.tsx",
        lineNumber: 496,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/tickets-sap.tsx",
    lineNumber: 267,
    columnNumber: 5
  }, this);
}

// app/routes/api.health.ts
var api_health_exports = {};
__export(api_health_exports, {
  loader: () => loader6
});
import { json as json4 } from "@remix-run/node";
var loader6 = async ({ request }) => (console.log(`API Health Check Request: ${request.url}`), json4({ status: "ok" }, 200));

// app/routes/envois-ctn.tsx
var envois_ctn_exports = {};
__export(envois_ctn_exports, {
  default: () => EnvoisCtn,
  meta: () => meta2
});
init_firestore_service_server();
import { useState as useState8, useEffect as useEffect5, useMemo as useMemo4, useCallback as useCallback5 } from "react";
import { useOutletContext as useOutletContext2, useSearchParams } from "@remix-run/react";
import { FontAwesomeIcon as FontAwesomeIcon6 } from "@fortawesome/react-fontawesome";
import { faTruckFast, faFilter as faFilter2, faSearch as faSearch3, faBuilding, faChevronRight as faChevronRight2, faExternalLinkAlt, faSpinner as faSpinner3, faTrash } from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV14 } from "react/jsx-dev-runtime";
var meta2 = () => [{ title: "Envois CTN | JDC Dashboard" }], groupShipmentsByClient = (shipments) => {
  let grouped = /* @__PURE__ */ new Map();
  return Array.isArray(shipments) && shipments.forEach((shipment) => {
    let clientName = shipment.nomClient || "Client Inconnu", existing = grouped.get(clientName);
    existing ? existing.push(shipment) : grouped.set(clientName, [shipment]);
  }), grouped;
};
function EnvoisCtn() {
  let { user } = useOutletContext2(), { addToast } = useToast(), [userProfile, setUserProfile] = useState8(null), [allShipments, setAllShipments] = useState8([]), [isLoading, setIsLoading] = useState8(!0), [error, setError] = useState8(null), [deletingGroup, setDeletingGroup] = useState8(null), [selectedSector, setSelectedSector] = useState8(""), [searchParams] = useSearchParams(), initialSearchTerm = searchParams.get("client") || "", [searchTerm, setSearchTerm] = useState8(initialSearchTerm);
  useEffect5(() => {
    let clientParam = searchParams.get("client");
    clientParam && clientParam !== searchTerm && setSearchTerm(clientParam);
  }, [searchParams, searchTerm]), useEffect5(() => {
    (async () => {
      if (!user) {
        setIsLoading(!1), setAllShipments([]), setUserProfile(null);
        return;
      }
      setIsLoading(!0), setError(null);
      try {
        let profile = await getUserProfileSdk(user.uid);
        if (setUserProfile(profile), !profile)
          throw setAllShipments([]), new Error("Profil utilisateur introuvable.");
        let shipments = await getAllShipments(profile);
        setAllShipments(shipments);
      } catch (err) {
        console.error("Error fetching data for Envois CTN:", err);
        let errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Erreur de chargement des donn\xE9es: ${errorMessage}`), setAllShipments([]);
      } finally {
        setIsLoading(!1);
      }
    })();
  }, [user]);
  let filteredAndGroupedShipments = useMemo4(() => {
    let filtered = allShipments, isAdmin2 = userProfile?.role === "Admin";
    if (selectedSector && selectedSector !== "" && (filtered = filtered.filter((s) => s.secteur === selectedSector)), searchTerm.trim() !== "") {
      let lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (s) => s.nomClient && s.nomClient.toLowerCase().includes(lowerSearchTerm) || s.codeClient && s.codeClient.toLowerCase().includes(lowerSearchTerm) || s.id && s.id.toLowerCase().includes(lowerSearchTerm) || s.articleNom && s.articleNom.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return groupShipmentsByClient(filtered);
  }, [allShipments, selectedSector, searchTerm, userProfile]), clientGroups = useMemo4(() => Array.from(filteredAndGroupedShipments.entries()).sort((a, b) => a[0].localeCompare(b[0])), [filteredAndGroupedShipments]), availableSectors = useMemo4(() => {
    let uniqueSectors = new Set(allShipments.map((s) => s.secteur).filter(Boolean));
    return Array.from(uniqueSectors).sort();
  }, [allShipments]), handleDeleteGroup = useCallback5(async (clientName, shipmentsToDelete) => {
    if (!shipmentsToDelete || shipmentsToDelete.length === 0)
      return;
    let shipmentCount = shipmentsToDelete.length;
    if (window.confirm(`\xCAtes-vous s\xFBr de vouloir supprimer les ${shipmentCount} envoi${shipmentCount > 1 ? "s" : ""} pour le client "${clientName}" ? Cette action est irr\xE9versible.`)) {
      setDeletingGroup(clientName);
      let shipmentIdsToDelete = shipmentsToDelete.map((s) => s.id), deletePromises = shipmentIdsToDelete.map((id) => deleteShipmentSdk(id));
      try {
        let results = await Promise.allSettled(deletePromises), successfulDeletes = results.filter((r) => r.status === "fulfilled").length, failedDeletes = results.filter((r) => r.status === "rejected").length;
        if (failedDeletes > 0) {
          console.error(`Failed to delete ${failedDeletes} shipments for client ${clientName}.`);
          let errorMessages = results.filter((r) => r.status === "rejected").map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason)).join(", ");
          addToast({ type: "error", message: `Erreur lors de la suppression de ${failedDeletes} envoi${failedDeletes > 1 ? "s" : ""} pour ${clientName}. D\xE9tails: ${errorMessages}` });
        }
        successfulDeletes > 0 && (setAllShipments((prevShipments) => prevShipments.filter((s) => !shipmentIdsToDelete.includes(s.id))), addToast({ type: "success", message: `${successfulDeletes} envoi${successfulDeletes > 1 ? "s" : ""} pour ${clientName} supprim\xE9${successfulDeletes > 1 ? "s" : ""} avec succ\xE8s.` }));
      } catch (error2) {
        console.error("Unexpected error during group deletion:", error2);
        let errorMessage = error2 instanceof Error ? error2.message : String(error2);
        addToast({ type: "error", message: `Erreur inattendue lors de la suppression du groupe: ${errorMessage}` });
      } finally {
        setDeletingGroup(null);
      }
    }
  }, [addToast]), isAdmin = userProfile?.role === "Admin";
  return !user && !isLoading ? /* @__PURE__ */ jsxDEV14("div", { className: "text-center text-jdc-gray-400 py-10", children: "Veuillez vous connecter pour voir les envois." }, void 0, !1, {
    fileName: "app/routes/envois-ctn.tsx",
    lineNumber: 180,
    columnNumber: 9
  }, this) : /* @__PURE__ */ jsxDEV14("div", { children: [
    /* @__PURE__ */ jsxDEV14("h1", { className: "text-2xl font-semibold text-white mb-4 flex items-center", children: [
      /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faTruckFast, className: "mr-3 text-jdc-yellow" }, void 0, !1, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 189,
        columnNumber: 9
      }, this),
      "Suivi des Envois CTN"
    ] }, void 0, !0, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 188,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV14("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-jdc-card rounded-lg shadow", children: [
      /* @__PURE__ */ jsxDEV14("div", { className: "col-span-1", children: [
        /* @__PURE__ */ jsxDEV14("label", { htmlFor: "sector-filter", className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
          /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faFilter2, className: "mr-1" }, void 0, !1, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 198,
            columnNumber: 13
          }, this),
          " Filtrer par Secteur"
        ] }, void 0, !0, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 197,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV14(
          "select",
          {
            id: "sector-filter",
            name: "sector-filter",
            value: selectedSector,
            onChange: (e) => setSelectedSector(e.target.value),
            className: "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-yellow focus:ring focus:ring-jdc-yellow focus:ring-opacity-50 text-white py-2 pl-3 pr-10",
            disabled: isLoading || availableSectors.length === 0,
            children: [
              /* @__PURE__ */ jsxDEV14("option", { value: "", children: "Tous les secteurs" }, void 0, !1, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 208,
                columnNumber: 13
              }, this),
              availableSectors.map((sector) => /* @__PURE__ */ jsxDEV14("option", { value: sector, children: sector }, sector, !1, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 210,
                columnNumber: 15
              }, this))
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 200,
            columnNumber: 11
          },
          this
        ),
        availableSectors.length === 0 && !isLoading && allShipments.length > 0 && /* @__PURE__ */ jsxDEV14("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun secteur trouv\xE9 dans les envois affich\xE9s." }, void 0, !1, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 214,
          columnNumber: 14
        }, this),
        availableSectors.length === 0 && !isLoading && allShipments.length === 0 && !error && /* @__PURE__ */ jsxDEV14("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun envoi accessible trouv\xE9." }, void 0, !1, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 217,
          columnNumber: 14
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 196,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV14("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsxDEV14(
        Input,
        {
          label: "Rechercher (Client, ID, Article...)",
          id: "search-client",
          name: "search-client",
          placeholder: "Entrez un nom, code, ID, article...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          icon: /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faSearch3 }, void 0, !1, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 230,
            columnNumber: 20
          }, this),
          wrapperClassName: "mb-0",
          disabled: isLoading
        },
        void 0,
        !1,
        {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 223,
          columnNumber: 12
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 222,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 194,
      columnNumber: 7
    }, this),
    isLoading && /* @__PURE__ */ jsxDEV14("div", { className: "text-center text-jdc-gray-400 py-10", children: [
      /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faSpinner3, spin: !0, className: "text-2xl mr-2" }, void 0, !1, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 240,
        columnNumber: 11
      }, this),
      "Chargement des envois..."
    ] }, void 0, !0, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 239,
      columnNumber: 9
    }, this),
    error && !isLoading && /* @__PURE__ */ jsxDEV14("div", { className: "text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg", children: error }, void 0, !1, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 247,
      columnNumber: 9
    }, this),
    !isLoading && !error && clientGroups.length === 0 && /* @__PURE__ */ jsxDEV14("div", { className: "text-center text-jdc-gray-400 py-10", children: allShipments.length > 0 ? "Aucun envoi trouv\xE9 correspondant \xE0 votre recherche ou filtre." : "Aucun envoi accessible trouv\xE9 pour votre compte. V\xE9rifiez vos secteurs assign\xE9s si vous n'\xEAtes pas Admin." }, void 0, !1, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 252,
      columnNumber: 9
    }, this),
    !isLoading && !error && clientGroups.length > 0 && /* @__PURE__ */ jsxDEV14("div", { className: "space-y-3", children: clientGroups.map(([clientName, clientShipments]) => /* @__PURE__ */ jsxDEV14("div", { className: "bg-jdc-card rounded-lg shadow overflow-hidden", children: /* @__PURE__ */ jsxDEV14("details", { className: "group", children: [
      /* @__PURE__ */ jsxDEV14("summary", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors gap-4", children: [
        /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center min-w-0 mr-2 flex-grow", children: [
          /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faBuilding, className: "mr-3 text-jdc-gray-300 text-lg flex-shrink-0" }, void 0, !1, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 268,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV14("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxDEV14("span", { className: "font-semibold text-white text-lg block truncate", title: clientName, children: clientName }, void 0, !1, {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 270,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV14("span", { className: "ml-0 md:ml-3 text-sm text-jdc-gray-400", children: [
              "(",
              clientShipments.length,
              " envoi",
              clientShipments.length > 1 ? "s" : "",
              ")"
            ] }, void 0, !0, {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 271,
              columnNumber: 25
            }, this),
            clientShipments[0]?.codeClient && clientShipments[0].codeClient !== clientName && /* @__PURE__ */ jsxDEV14("span", { className: "block text-xs text-jdc-gray-500 truncate", title: `Code: ${clientShipments[0].codeClient}`, children: [
              "Code: ",
              clientShipments[0].codeClient
            ] }, void 0, !0, {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 275,
              columnNumber: 29
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 269,
            columnNumber: 21
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 267,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center flex-shrink-0 space-x-3", children: [
          isAdmin && /* @__PURE__ */ jsxDEV14(
            Button,
            {
              variant: "danger",
              size: "sm",
              title: `Supprimer tous les envois pour ${clientName}`,
              onClick: (e) => {
                e.preventDefault(), e.stopPropagation(), handleDeleteGroup(clientName, clientShipments);
              },
              isLoading: deletingGroup === clientName,
              disabled: deletingGroup !== null && deletingGroup !== clientName,
              leftIcon: /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faTrash }, void 0, !1, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 293,
                columnNumber: 39
              }, this),
              className: "flex-shrink-0",
              children: "Suppr. Groupe"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 282,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV14(
            FontAwesomeIcon6,
            {
              icon: faChevronRight2,
              className: "text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 299,
              columnNumber: 21
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 280,
          columnNumber: 19
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 266,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV14("div", { className: "border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3", children: clientShipments.map((shipment) => {
        let statusStyle = getShipmentStatusStyle(shipment.statutExpedition), truncatedArticle = shipment.articleNom && shipment.articleNom.length > 50 ? `${shipment.articleNom.substring(0, 47)}...` : shipment.articleNom;
        return /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center justify-between text-sm border-b border-jdc-gray-700 pb-2 last:border-b-0 gap-2", children: [
          /* @__PURE__ */ jsxDEV14("div", { className: "flex-1 min-w-0 mr-1", children: [
            /* @__PURE__ */ jsxDEV14("span", { className: "text-jdc-gray-200 block font-medium truncate", title: shipment.articleNom, children: truncatedArticle || "Article non sp\xE9cifi\xE9" }, void 0, !1, {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 316,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center flex-wrap mt-1 space-x-2", children: [
              /* @__PURE__ */ jsxDEV14("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`, children: shipment.statutExpedition || "Inconnu" }, void 0, !1, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 320,
                columnNumber: 31
              }, this),
              /* @__PURE__ */ jsxDEV14("span", { className: "text-jdc-gray-500 text-xs whitespace-nowrap", title: `ID: ${shipment.id}`, children: [
                "ID: ",
                shipment.id.substring(0, 8),
                "..."
              ] }, void 0, !0, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 323,
                columnNumber: 31
              }, this),
              /* @__PURE__ */ jsxDEV14("span", { className: "text-jdc-gray-500 text-xs whitespace-nowrap", children: [
                "Secteur: ",
                shipment.secteur || "N/A"
              ] }, void 0, !0, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 326,
                columnNumber: 32
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 319,
              columnNumber: 27
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 315,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center flex-shrink-0 space-x-2", children: shipment.trackingLink && /* @__PURE__ */ jsxDEV14(
            Button,
            {
              as: "link",
              to: shipment.trackingLink,
              target: "_blank",
              rel: "noopener noreferrer",
              variant: "secondary",
              size: "sm",
              title: "Suivre le colis",
              leftIcon: /* @__PURE__ */ jsxDEV14(FontAwesomeIcon6, { icon: faExternalLinkAlt }, void 0, !1, {
                fileName: "app/routes/envois-ctn.tsx",
                lineNumber: 342,
                columnNumber: 43
              }, this),
              children: "Suivi"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/envois-ctn.tsx",
              lineNumber: 334,
              columnNumber: 31
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/envois-ctn.tsx",
            lineNumber: 332,
            columnNumber: 25
          }, this)
        ] }, shipment.id, !0, {
          fileName: "app/routes/envois-ctn.tsx",
          lineNumber: 314,
          columnNumber: 23
        }, this);
      }) }, void 0, !1, {
        fileName: "app/routes/envois-ctn.tsx",
        lineNumber: 306,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 265,
      columnNumber: 15
    }, this) }, clientName, !1, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 264,
      columnNumber: 13
    }, this)) }, void 0, !1, {
      fileName: "app/routes/envois-ctn.tsx",
      lineNumber: 262,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/envois-ctn.tsx",
    lineNumber: 187,
    columnNumber: 5
  }, this);
}

// app/routes/dashboard.tsx
var dashboard_exports = {};
__export(dashboard_exports, {
  default: () => Dashboard,
  loader: () => loader7,
  meta: () => meta3
});
import { json as json5 } from "@remix-run/node";
import { useOutletContext as useOutletContext3, useLoaderData as useLoaderData4 } from "@remix-run/react";
import { useState as useState12, useEffect as useEffect9, lazy, Suspense as Suspense2 } from "react";
init_dateUtils();

// app/components/StatsCard.tsx
import { FontAwesomeIcon as FontAwesomeIcon7 } from "@fortawesome/react-fontawesome";
import { faSpinner as faSpinner4 } from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV15 } from "react/jsx-dev-runtime";
var getStatTypeFromTitle = (title) => title.toLowerCase().includes("ticket") ? "ticket SAP" : title.toLowerCase().includes("envois") ? "envois CTN" : title.toLowerCase().includes("client") ? "clients actifs" : "donn\xE9es", StatsCard = ({ title, value, icon, isLoading = !1, evolutionValue }) => {
  let showEvolution = typeof evolutionValue == "number" && evolutionValue !== 0, isPositive = evolutionValue && evolutionValue > 0, evolutionColor = isPositive ? "text-green-500" : "text-red-500", evolutionArrow = isPositive ? "\u2191" : "\u2193", statType = getStatTypeFromTitle(title);
  return /* @__PURE__ */ jsxDEV15("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex items-start space-x-4 transition-colors duration-200 hover:bg-jdc-gray-800", children: [
    /* @__PURE__ */ jsxDEV15("div", { className: "p-3 rounded-full bg-jdc-yellow text-black flex-shrink-0 mt-1", children: /* @__PURE__ */ jsxDEV15(FontAwesomeIcon7, { icon, className: "h-6 w-6" }, void 0, !1, {
      fileName: "app/components/StatsCard.tsx",
      lineNumber: 35,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/StatsCard.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV15("div", { className: "flex-grow", children: [
      /* @__PURE__ */ jsxDEV15("p", { className: "text-sm text-jdc-gray-400", children: title }, void 0, !1, {
        fileName: "app/components/StatsCard.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV15("p", { className: `text-2xl font-semibold text-white mt-1 ${isLoading ? "animate-pulse" : ""}`, children: isLoading ? /* @__PURE__ */ jsxDEV15(FontAwesomeIcon7, { icon: faSpinner4, spin: !0 }, void 0, !1, {
        fileName: "app/components/StatsCard.tsx",
        lineNumber: 45,
        columnNumber: 24
      }, this) : value }, void 0, !1, {
        fileName: "app/components/StatsCard.tsx",
        lineNumber: 44,
        columnNumber: 9
      }, this),
      !isLoading && showEvolution && /* @__PURE__ */ jsxDEV15("p", { className: `text-xs font-medium ${evolutionColor} mt-1`, children: [
        "\xE9volution ",
        statType,
        " (24h) : ",
        evolutionArrow,
        " ",
        isPositive ? "+" : "",
        evolutionValue
      ] }, void 0, !0, {
        fileName: "app/components/StatsCard.tsx",
        lineNumber: 50,
        columnNumber: 11
      }, this),
      !isLoading && !showEvolution && /* @__PURE__ */ jsxDEV15("p", { className: "text-xs font-medium text-transparent mt-1 h-[1em]", children: [
        " ",
        "\xA0 "
      ] }, void 0, !0, {
        fileName: "app/components/StatsCard.tsx",
        lineNumber: 56,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/StatsCard.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/StatsCard.tsx",
    lineNumber: 32,
    columnNumber: 5
  }, this);
};

// app/components/RecentTickets.tsx
init_dateUtils();
import { FontAwesomeIcon as FontAwesomeIcon8 } from "@fortawesome/react-fontawesome";
import { faTicket as faTicket2, faSpinner as faSpinner5, faExclamationTriangle as faExclamationTriangle3 } from "@fortawesome/free-solid-svg-icons";

// tailwind.config.ts
var tailwind_config_default = {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "jdc-yellow": "#FFD700",
        // Jaune JDC
        "jdc-black": "#000000",
        // Noir JDC
        "jdc-card": "#1F1F1F",
        // Fond de carte sombre
        "jdc-gray": {
          300: "#CCCCCC",
          // Gris clair pour texte/bordures
          400: "#A0A0A0",
          // Gris moyen
          800: "#333333"
          // Gris foncé pour fond alternatif/texte
        },
        "jdc-blue-dark": "#0a0f1f",
        // Très foncé, pour le fond principal
        "jdc-white": "#FFFFFF"
        // Blanc standard pour texte sur fond sombre
      },
      fontFamily: {
        sans: [
          '"Roboto"',
          // Nouvelle police principale
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      }
    }
  },
  plugins: []
  // Remove DaisyUI plugin
};

// app/components/RecentTickets.tsx
import { jsxDEV as jsxDEV16 } from "react/jsx-dev-runtime";
var jdcYellowColor = tailwind_config_default.theme.extend.colors["jdc-yellow"], RecentTickets = ({ tickets, isLoading = !1, error = null }) => {
  let getClientDisplay = (ticket) => ticket.raisonSociale || ticket.codeClient || "Client inconnu", getSummaryDisplay = (summary) => summary ? summary.length > 40 ? summary.substring(0, 40) + "..." : summary : "Pas de r\xE9sum\xE9", getStatusClasses = (status) => {
    switch (status) {
      case "Nouveau":
        return "bg-green-600 text-white";
      case "Demande de RMA":
        return "bg-blue-600 text-white";
      case "Ouvert":
        return "bg-red-600 text-white";
      case "En cours":
        return "bg-yellow-500 text-black";
      case "Ferm\xE9":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  return /* @__PURE__ */ jsxDEV16("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsxDEV16("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsxDEV16(FontAwesomeIcon8, { icon: faTicket2, className: "mr-2", color: jdcYellowColor }, void 0, !1, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this),
      "Tickets SAP R\xE9cents"
    ] }, void 0, !0, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    isLoading && /* @__PURE__ */ jsxDEV16("div", { className: "flex items-center justify-center text-jdc-gray-300 py-4", children: [
      /* @__PURE__ */ jsxDEV16(FontAwesomeIcon8, { icon: faSpinner5, spin: !0, className: "mr-2" }, void 0, !1, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 56,
        columnNumber: 11
      }, this),
      "Chargement..."
    ] }, void 0, !0, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 55,
      columnNumber: 9
    }, this),
    error && !isLoading && /* @__PURE__ */ jsxDEV16("div", { className: "flex items-center text-red-400 py-4", children: [
      /* @__PURE__ */ jsxDEV16(FontAwesomeIcon8, { icon: faExclamationTriangle3, className: "mr-2" }, void 0, !1, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 62,
        columnNumber: 12
      }, this),
      "Erreur: ",
      error
    ] }, void 0, !0, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 61,
      columnNumber: 10
    }, this),
    !isLoading && !error && tickets.length === 0 && /* @__PURE__ */ jsxDEV16("p", { className: "text-jdc-gray-400 text-center py-4", children: "Aucun ticket r\xE9cent \xE0 afficher." }, void 0, !1, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 67,
      columnNumber: 9
    }, this),
    !isLoading && !error && tickets.length > 0 && /* @__PURE__ */ jsxDEV16("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2", children: tickets.map((ticket) => /* @__PURE__ */ jsxDEV16("li", { className: "flex justify-between items-start text-sm p-2 bg-jdc-gray-800 rounded hover:bg-jdc-gray-700", children: [
      /* @__PURE__ */ jsxDEV16("div", { className: "flex-grow mr-2", children: [
        /* @__PURE__ */ jsxDEV16("span", { className: "font-medium text-white block", children: getClientDisplay(ticket) }, void 0, !1, {
          fileName: "app/components/RecentTickets.tsx",
          lineNumber: 74,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV16("span", { className: "text-jdc-gray-400 block text-xs", children: [
          getSummaryDisplay(ticket.summary),
          " - ",
          ticket.secteur || "Secteur N/A"
        ] }, void 0, !0, {
          fileName: "app/components/RecentTickets.tsx",
          lineNumber: 75,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV16("span", { className: "text-jdc-gray-500 block text-xs italic", children: formatDateForDisplay(parseFrenchDate(ticket.date)) }, void 0, !1, {
          fileName: "app/components/RecentTickets.tsx",
          lineNumber: 78,
          columnNumber: 18
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 73,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV16("div", { className: "flex-shrink-0 text-right", children: /* @__PURE__ */ jsxDEV16("span", { className: `px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusClasses(ticket.statut)}`, children: ticket.statut || "N/A" }, void 0, !1, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 85,
        columnNumber: 17
      }, this) }, void 0, !1, {
        fileName: "app/components/RecentTickets.tsx",
        lineNumber: 83,
        columnNumber: 15
      }, this)
    ] }, ticket.id, !0, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 72,
      columnNumber: 13
    }, this)) }, void 0, !1, {
      fileName: "app/components/RecentTickets.tsx",
      lineNumber: 70,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/RecentTickets.tsx",
    lineNumber: 48,
    columnNumber: 5
  }, this);
};

// app/components/RecentShipments.tsx
import { useMemo as useMemo5 } from "react";
import { Link as Link6 } from "@remix-run/react";
import { FontAwesomeIcon as FontAwesomeIcon9 } from "@fortawesome/react-fontawesome";
import { faTruckFast as faTruckFast2, faBuilding as faBuilding2 } from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV17 } from "react/jsx-dev-runtime";
var getUniqueClientNames = (shipments) => {
  if (!Array.isArray(shipments))
    return [];
  let names = /* @__PURE__ */ new Set();
  return shipments.forEach((shipment) => {
    shipment.nomClient && names.add(shipment.nomClient);
  }), Array.from(names).sort((a, b) => a.localeCompare(b));
}, RecentShipments = ({ shipments, isLoading }) => {
  let uniqueClientNames = useMemo5(() => getUniqueClientNames(shipments), [shipments]);
  return /* @__PURE__ */ jsxDEV17("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsxDEV17("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsxDEV17(FontAwesomeIcon9, { icon: faTruckFast2, className: "mr-2 text-jdc-yellow" }, void 0, !1, {
        fileName: "app/components/RecentShipments.tsx",
        lineNumber: 36,
        columnNumber: 9
      }, this),
      "Clients CTN R\xE9cents (via Envois)"
    ] }, void 0, !0, {
      fileName: "app/components/RecentShipments.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    isLoading ? /* @__PURE__ */ jsxDEV17("div", { className: "flex items-center justify-center text-jdc-gray-300 py-4", children: [
      /* @__PURE__ */ jsxDEV17(FontAwesomeIcon9, { icon: faTruckFast2, spin: !0, className: "mr-2" }, void 0, !1, {
        fileName: "app/components/RecentShipments.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this),
      "Chargement..."
    ] }, void 0, !0, {
      fileName: "app/components/RecentShipments.tsx",
      lineNumber: 40,
      columnNumber: 9
    }, this) : uniqueClientNames.length === 0 ? /* @__PURE__ */ jsxDEV17("p", { className: "text-jdc-gray-400 text-center py-4", children: "Aucun client trouv\xE9 dans les envois r\xE9cents." }, void 0, !1, {
      fileName: "app/components/RecentShipments.tsx",
      lineNumber: 46,
      columnNumber: 9
    }, this) : (
      // Use similar list styling as RecentTickets
      /* @__PURE__ */ jsxDEV17("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2", children: uniqueClientNames.map((clientName) => (
        // Apply tile styling to the list item itself
        /* @__PURE__ */ jsxDEV17("li", { className: "text-sm p-2 bg-jdc-gray-800 rounded hover:bg-jdc-gray-700 transition-colors duration-150", children: /* @__PURE__ */ jsxDEV17(
          Link6,
          {
            to: `/envois-ctn?client=${encodeURIComponent(clientName)}`,
            className: "flex items-center w-full",
            children: [
              /* @__PURE__ */ jsxDEV17(FontAwesomeIcon9, { icon: faBuilding2, className: "mr-2 text-jdc-gray-300 flex-shrink-0" }, void 0, !1, {
                fileName: "app/components/RecentShipments.tsx",
                lineNumber: 57,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV17("span", { className: "font-medium text-white truncate", title: clientName, children: clientName }, void 0, !1, {
                fileName: "app/components/RecentShipments.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, this)
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/RecentShipments.tsx",
            lineNumber: 53,
            columnNumber: 15
          },
          this
        ) }, clientName, !1, {
          fileName: "app/components/RecentShipments.tsx",
          lineNumber: 52,
          columnNumber: 13
        }, this)
      )) }, void 0, !1, {
        fileName: "app/components/RecentShipments.tsx",
        lineNumber: 49,
        columnNumber: 9
      }, this)
    )
  ] }, void 0, !0, {
    fileName: "app/components/RecentShipments.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
};

// app/components/ClientOnly.tsx
import { useState as useState9, useEffect as useEffect6 } from "react";
function ClientOnly({ children, fallback = null }) {
  let [isMounted, setIsMounted] = useState9(!1);
  return useEffect6(() => {
    setIsMounted(!0);
  }, []), isMounted ? children() : fallback;
}

// app/routes/dashboard.tsx
init_firestore_service_server();
import { FontAwesomeIcon as FontAwesomeIcon11 } from "@fortawesome/react-fontawesome";
import { faTicket as faTicket3, faUsers, faMapMarkedAlt as faMapMarkedAlt2, faSpinner as faSpinner7, faExclamationTriangle as faExclamationTriangle5, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { jsxDEV as jsxDEV19 } from "react/jsx-dev-runtime";
var InteractiveMap2 = lazy(() => Promise.resolve().then(() => (init_InteractiveMap(), InteractiveMap_exports))), meta3 = () => [{ title: "Tableau de Bord | JDC Dashboard" }], loader7 = async ({ request }) => {
  console.log("Dashboard Loader: Executing...");
  let session = await authenticator.isAuthenticated(request), calendarEvents = [], calendarError = null;
  if (session) {
    console.log("Dashboard Loader: User authenticated, attempting to fetch calendar events.");
    try {
      let authClient = await getGoogleAuthClient(session), { startOfWeek, endOfWeek } = getWeekDateRangeForAgenda(), timeMin = startOfWeek.toISOString(), timeMax = endOfWeek.toISOString();
      calendarEvents = (await getCalendarEvents(authClient, timeMin, timeMax)).map((event) => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink
      })), console.log(`Dashboard Loader: Fetched ${calendarEvents.length} calendar events.`);
    } catch (error) {
      console.error("Dashboard Loader: Error fetching calendar events:", error), calendarError = error.message || "Erreur lors de la r\xE9cup\xE9ration de l'agenda.", (error.message.includes("token") || error.message.includes("authenticate")) && (calendarError = "Erreur d'authentification Google Calendar. Veuillez vous reconnecter."), error.message.includes("Permission denied") && (calendarError = "Acc\xE8s \xE0 Google Calendar refus\xE9. V\xE9rifiez les autorisations."), (error.message.includes("Quota exceeded") || error.message.includes("RESOURCE_EXHAUSTED")) && (calendarError = "Quota Google Calendar d\xE9pass\xE9.");
    }
  } else
    console.log("Dashboard Loader: User not authenticated.");
  return json5({ calendarEvents, calendarError });
}, MapLoadingFallback = () => /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]", children: [
  /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faSpinner7, spin: !0, className: "text-jdc-yellow text-3xl mb-4" }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 118,
    columnNumber: 5
  }, this),
  /* @__PURE__ */ jsxDEV19("p", { className: "text-jdc-gray-400 text-center", children: "Chargement de la carte..." }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 119,
    columnNumber: 5
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 117,
  columnNumber: 3
}, this), MapLoginPrompt = () => /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]", children: [
  /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faMapMarkedAlt2, className: "text-jdc-gray-500 text-4xl mb-4" }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 125,
    columnNumber: 9
  }, this),
  /* @__PURE__ */ jsxDEV19("p", { className: "text-jdc-gray-400 text-center", children: "Connectez-vous pour voir la carte des tickets." }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 126,
    columnNumber: 9
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 124,
  columnNumber: 4
}, this), WeeklyAgenda = ({ events, error, isLoading }) => isLoading ? /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center", children: [
  /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faSpinner7, spin: !0, className: "text-jdc-yellow text-xl mr-2" }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 135,
    columnNumber: 18
  }, this),
  /* @__PURE__ */ jsxDEV19("span", { className: "text-jdc-gray-400", children: "Chargement de l'agenda..." }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 136,
    columnNumber: 18
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 134,
  columnNumber: 14
}, this) : error ? /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
  /* @__PURE__ */ jsxDEV19("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center", children: [
    /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 144,
      columnNumber: 22
    }, this),
    "Agenda de la semaine"
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 143,
    columnNumber: 18
  }, this),
  /* @__PURE__ */ jsxDEV19("div", { className: "text-red-400 bg-red-900 bg-opacity-50 p-3 rounded", children: [
    /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faExclamationTriangle5, className: "mr-1" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 148,
      columnNumber: 22
    }, this),
    " ",
    error
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 147,
    columnNumber: 18
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 142,
  columnNumber: 14
}, this) : events.length === 0 ? /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
  /* @__PURE__ */ jsxDEV19("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center", children: [
    /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 157,
      columnNumber: 22
    }, this),
    "Agenda de la semaine"
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 156,
    columnNumber: 18
  }, this),
  /* @__PURE__ */ jsxDEV19("p", { className: "text-jdc-gray-400", children: "Aucun \xE9v\xE9nement trouv\xE9 pour cette p\xE9riode." }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 160,
    columnNumber: 18
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 155,
  columnNumber: 14
}, this) : /* @__PURE__ */ jsxDEV19("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
  /* @__PURE__ */ jsxDEV19("h3", { className: "text-lg font-semibold text-white mb-3 flex items-center", children: [
    /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 169,
      columnNumber: 17
    }, this),
    "Agenda de la semaine"
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 168,
    columnNumber: 13
  }, this),
  /* @__PURE__ */ jsxDEV19("ul", { className: "space-y-2", children: events.map((event) => /* @__PURE__ */ jsxDEV19("li", { className: "text-sm border-b border-jdc-gray-700 pb-1 last:border-b-0", children: [
    /* @__PURE__ */ jsxDEV19("span", { className: "font-medium text-jdc-gray-200", children: event.summary || "(Sans titre)" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 175,
      columnNumber: 25
    }, this),
    /* @__PURE__ */ jsxDEV19("span", { className: "text-xs text-jdc-gray-400 ml-2", children: [
      "(",
      formatEventTime(event.start),
      " - ",
      formatEventTime(event.end),
      ")"
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 176,
      columnNumber: 25
    }, this),
    event.htmlLink && /* @__PURE__ */ jsxDEV19("a", { href: event.htmlLink, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-jdc-blue hover:underline ml-2", children: "(Voir)" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 179,
      columnNumber: 45
    }, this)
  ] }, event.id, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 174,
    columnNumber: 21
  }, this)) }, void 0, !1, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 172,
    columnNumber: 13
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/dashboard.tsx",
  lineNumber: 167,
  columnNumber: 9
}, this), formatEventTime = (eventDateTime) => {
  if (!eventDateTime)
    return "N/A";
  if (eventDateTime.dateTime)
    try {
      return new Date(eventDateTime.dateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Heure invalide";
    }
  if (eventDateTime.date)
    try {
      let [year, month, day] = eventDateTime.date.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    } catch {
      return "Date invalide";
    }
  return "N/A";
};
function Dashboard() {
  let { user, profile, profileLoading } = useOutletContext3(), { calendarEvents, calendarError } = useLoaderData4(), [liveTicketCount, setLiveTicketCount] = useState12(null), [liveDistinctClientCountFromEnvoi, setLiveDistinctClientCountFromEnvoi] = useState12(null), [evolution, setEvolution] = useState12({
    ticketCount: null,
    distinctClientCountFromEnvoi: null
  }), [recentTickets, setRecentTickets] = useState12([]), [recentShipments, setRecentShipments] = useState12([]), [loadingStats, setLoadingStats] = useState12(!0), [loadingTickets, setLoadingTickets] = useState12(!0), [loadingShipments, setLoadingShipments] = useState12(!0), [clientError, setClientError] = useState12(null), [fetchTrigger, setFetchTrigger] = useState12(0);
  useEffect9(() => {
    (async () => {
      if (profileLoading) {
        console.log("Dashboard Effect: Waiting for profile to load...");
        return;
      }
      if (user && !profile && console.warn("Dashboard Effect: User session exists but profile is null after loading."), !user) {
        setLoadingStats(!1), setLoadingTickets(!1), setLoadingShipments(!1), setLiveTicketCount(null), setLiveDistinctClientCountFromEnvoi(null), setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null }), setRecentTickets([]), setRecentShipments([]), setClientError(null);
        return;
      }
      setLoadingStats(!0), setLoadingTickets(!0), setLoadingShipments(!0), setClientError(null), console.log("Dashboard Effect: Fetching client-side data (stats, tickets, shipments)...");
      try {
        let userProfile = profile, userSectors = userProfile?.secteurs ?? [], sectorsForTickets = userSectors, sectorsForShipments = userProfile?.role === "Admin" ? [] : userSectors;
        console.log(`Dashboard Effect: Using sectors for tickets: ${JSON.stringify(sectorsForTickets)}`), console.log(`Dashboard Effect: Using sectors for shipments: ${sectorsForShipments.length === 0 && userProfile?.role === "Admin" ? "(Admin - All)" : JSON.stringify(sectorsForShipments)}`);
        let results = await Promise.allSettled([
          getLatestStatsSnapshotsSdk(1),
          getTotalTicketCountSdk(sectorsForTickets),
          getDistinctClientCountFromEnvoiSdk(userProfile),
          // Pass profile directly
          getRecentTicketsForSectors(sectorsForTickets, 20),
          getRecentShipmentsForSectors(sectorsForShipments, 20)
        ]), snapshotResult = results[0], ticketCountResult = results[1], distinctClientCountResult = results[2], latestSnapshot = snapshotResult.status === "fulfilled" && snapshotResult.value.length > 0 ? snapshotResult.value[0] : null, fetchedLiveTicketCount = ticketCountResult.status === "fulfilled" ? ticketCountResult.value : null, fetchedLiveDistinctClientCountFromEnvoi = distinctClientCountResult.status === "fulfilled" ? distinctClientCountResult.value : null;
        results.forEach((result, index) => {
          result.status === "rejected" && (console.error(`Dashboard Effect: Error fetching client-side data at index ${index}:`, result.reason), clientError || (index === 0 && setClientError("Erreur chargement \xE9volution."), index === 1 && setClientError("Erreur chargement total tickets."), index === 2 && setClientError("Erreur chargement clients distincts.")));
        }), setLiveTicketCount(fetchedLiveTicketCount), setLiveDistinctClientCountFromEnvoi(fetchedLiveDistinctClientCountFromEnvoi);
        let calculatedEvolution = { ticketCount: null, distinctClientCountFromEnvoi: null };
        latestSnapshot ? (fetchedLiveTicketCount !== null && latestSnapshot.totalTickets !== void 0 && (calculatedEvolution.ticketCount = fetchedLiveTicketCount - latestSnapshot.totalTickets), fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients !== void 0 && (calculatedEvolution.distinctClientCountFromEnvoi = fetchedLiveDistinctClientCountFromEnvoi - latestSnapshot.activeClients)) : snapshotResult.status === "rejected" && !clientError && setClientError("Donn\xE9es snapshot manquantes."), setEvolution(calculatedEvolution);
        let recentTicketsResult = results[3], recentShipmentsResult = results[4];
        setRecentTickets(recentTicketsResult.status === "fulfilled" ? recentTicketsResult.value : []), setRecentShipments(recentShipmentsResult.status === "fulfilled" ? recentShipmentsResult.value : []);
      } catch (err) {
        setClientError(err.message || "Erreur g\xE9n\xE9rale chargement donn\xE9es client."), setLiveTicketCount(null), setLiveDistinctClientCountFromEnvoi(null), setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null }), setRecentTickets([]), setRecentShipments([]);
      } finally {
        setLoadingStats(!1), setLoadingTickets(!1), setLoadingShipments(!1), console.log("Dashboard Effect: Client-side data fetching finished.");
      }
    })();
  }, [user, profile, profileLoading, fetchTrigger]);
  let formatStatValue = (value, isLoading) => isLoading ? "..." : value == null ? "N/A" : value.toString(), statsData = [
    { title: "Tickets SAP (Total)", valueState: liveTicketCount, icon: faTicket3, evolutionKey: "ticketCount", loadingState: loadingStats },
    { title: "Clients CTN (Distincts)", valueState: liveDistinctClientCountFromEnvoi, icon: faUsers, evolutionKey: "distinctClientCountFromEnvoi", loadingState: loadingStats }
  ], isOverallLoading = loadingStats || loadingTickets || loadingShipments || profileLoading, ticketsForList = recentTickets.slice(0, 5);
  return /* @__PURE__ */ jsxDEV19("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDEV19("h1", { className: "text-3xl font-semibold text-white", children: "Tableau de Bord" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 351,
      columnNumber: 7
    }, this),
    clientError && /* @__PURE__ */ jsxDEV19("div", { className: "flex items-center p-4 bg-red-800 text-white rounded-lg mb-4", children: [
      /* @__PURE__ */ jsxDEV19(FontAwesomeIcon11, { icon: faExclamationTriangle5, className: "mr-2" }, void 0, !1, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 355,
        columnNumber: 11
      }, this),
      clientError
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 354,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV19("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: statsData.map((stat) => {
      let isLoading = stat.loadingState, mainValue = stat.valueState, evolutionDisplayValue = evolution[stat.evolutionKey];
      return /* @__PURE__ */ jsxDEV19(
        StatsCard,
        {
          title: stat.title,
          value: formatStatValue(mainValue, isLoading),
          icon: stat.icon,
          isLoading,
          evolutionValue: evolutionDisplayValue
        },
        stat.title,
        !1,
        {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 365,
          columnNumber: 14
        },
        this
      );
    }) }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 359,
      columnNumber: 8
    }, this),
    /* @__PURE__ */ jsxDEV19(
      WeeklyAgenda,
      {
        events: calendarEvents,
        error: calendarError,
        isLoading: !user && !calendarError
      },
      void 0,
      !1,
      {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 378,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDEV19("div", { className: "w-full mb-6", children: /* @__PURE__ */ jsxDEV19(ClientOnly, { fallback: /* @__PURE__ */ jsxDEV19(MapLoadingFallback, {}, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 386,
      columnNumber: 31
    }, this), children: () => (
      // Use profile from context
      user ? /* @__PURE__ */ jsxDEV19(Suspense2, { fallback: /* @__PURE__ */ jsxDEV19(MapLoadingFallback, {}, void 0, !1, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 389,
        columnNumber: 35
      }, this), children: /* @__PURE__ */ jsxDEV19(
        InteractiveMap2,
        {
          tickets: recentTickets,
          isLoadingTickets: loadingTickets
        },
        void 0,
        !1,
        {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 390,
          columnNumber: 17
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 389,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV19(MapLoginPrompt, {}, void 0, !1, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 396,
        columnNumber: 15
      }, this)
    ) }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 386,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 385,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV19("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxDEV19(
        RecentTickets,
        {
          tickets: ticketsForList,
          isLoading: loadingTickets
        },
        void 0,
        !1,
        {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 404,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV19(
        RecentShipments,
        {
          shipments: recentShipments,
          isLoading: loadingShipments
        },
        void 0,
        !1,
        {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 408,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 403,
      columnNumber: 7
    }, this),
    !user && !isOverallLoading && !clientError && /* @__PURE__ */ jsxDEV19("div", { className: "p-4 bg-jdc-card rounded-lg text-center text-jdc-gray-300 mt-6", children: "Veuillez vous connecter pour voir le tableau de bord." }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 415,
      columnNumber: 10
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 350,
    columnNumber: 5
  }, this);
}

// app/routes/articles.tsx
var articles_exports = {};
__export(articles_exports, {
  default: () => ArticlesSearch,
  loader: () => loader8
});
init_firestore_service_server();
import { json as json6 } from "@remix-run/node";
import { Form as Form2, useLoaderData as useLoaderData5, useSearchParams as useSearchParams2 } from "@remix-run/react";
import { useState as useState13, useEffect as useEffect10 } from "react";
import { useOutletContext as useOutletContext4 } from "@remix-run/react";
import { useRef as useRef4 } from "react";
import { FontAwesomeIcon as FontAwesomeIcon12 } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner as faSpinner8, faTimes as faTimes4, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Fragment as Fragment7, jsxDEV as jsxDEV20 } from "react/jsx-dev-runtime";
async function loader8({ request }) {
  let url = new URL(request.url), code = url.searchParams.get("code")?.trim() || "", nom = url.searchParams.get("nom")?.trim() || "";
  return console.log("Articles Loader: Returning search params", { code, nom }), json6({ searchParams: { code, nom } });
}
function ArticlesSearch() {
  let { searchParams: loaderSearchParams } = useLoaderData5(), [searchParams] = useSearchParams2(), { user, loadingAuth } = useOutletContext4(), [localArticles, setLocalArticles] = useState13([]), [isLoading, setIsLoading] = useState13(!1), [fetchError, setFetchError] = useState13(null), [codeSearch, setCodeSearch] = useState13(loaderSearchParams.code), [nomSearch, setNomSearch] = useState13(loaderSearchParams.nom), [uploadingImageId, setUploadingImageId] = useState13(null), [uploadError, setUploadError] = useState13(null), fileInputRef = useRef4(null), [selectedImageUrl, setSelectedImageUrl] = useState13(null), [isImageModalOpen, setIsImageModalOpen] = useState13(!1), [deletingImageUrl, setDeletingImageUrl] = useState13(null), [deleteError, setDeleteError] = useState13(null);
  useEffect10(() => {
    let currentCode = searchParams.get("code")?.trim() || "", currentNom = searchParams.get("nom")?.trim() || "";
    setCodeSearch(currentCode), setNomSearch(currentNom), !loadingAuth && user && (currentCode || currentNom) ? (async () => {
      setIsLoading(!0), setFetchError(null), setLocalArticles([]), console.log("Client Search: Performing search for", { code: currentCode, nom: currentNom });
      try {
        let results = await searchArticles({ code: currentCode, nom: currentNom });
        setLocalArticles(results), console.log("Client Search: Found results", results);
      } catch (err) {
        console.error("Client Search: Error fetching articles", err), setFetchError(err.message || "Erreur lors de la recherche c\xF4t\xE9 client.");
      } finally {
        setIsLoading(!1);
      }
    })() : (setLocalArticles([]), setIsLoading(!1), setFetchError(null));
  }, [searchParams, loadingAuth, user]);
  let handleAddPhotoClick = (articleId) => {
    setUploadError(null), setUploadingImageId(null), fileInputRef.current && (fileInputRef.current.setAttribute("data-article-id", articleId), fileInputRef.current.click());
  }, handleFileSelected = async (event) => {
    let file = event.target.files?.[0], targetArticleId = event.target.getAttribute("data-article-id");
    if (file && targetArticleId) {
      console.log(`Fichier s\xE9lectionn\xE9: ${file.name} pour l'article ID: ${targetArticleId}`), setUploadingImageId(targetArticleId), setUploadError(null), setDeleteError(null);
      let CLOUDINARY_CLOUD_NAME = "dkeqzl54y", CLOUDINARY_UPLOAD_PRESET = "jdc-img", CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, formData = new FormData();
      formData.append("file", file), formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      try {
        console.log(`Upload vers Cloudinary pour l'article ${targetArticleId}...`);
        let response = await fetch(CLOUDINARY_API_URL, {
          method: "POST",
          body: formData
        });
        if (!response.ok) {
          let errorData = await response.json();
          throw console.error("Erreur API Cloudinary:", errorData), new Error(errorData.error?.message || `\xC9chec de l'upload Cloudinary (HTTP ${response.status})`);
        }
        let imageUrl = (await response.json()).secure_url;
        console.log("Upload Cloudinary r\xE9ussi. URL:", imageUrl), await addArticleImageUrl(targetArticleId, imageUrl), console.log("Mise \xE0 jour Firestore termin\xE9e pour", targetArticleId), setLocalArticles(
          (prevArticles) => prevArticles.map((art) => {
            if (art.id === targetArticleId) {
              let updatedUrls = [...art.imageUrls || [], imageUrl];
              return { ...art, imageUrls: updatedUrls };
            }
            return art;
          })
        );
      } catch (error) {
        console.error("Erreur pendant l'upload ou la mise \xE0 jour Firestore:", error), setUploadError(error.message || "\xC9chec de l'upload de l'image.");
      } finally {
        setUploadingImageId(null), fileInputRef.current && (fileInputRef.current.value = "", fileInputRef.current.removeAttribute("data-article-id"));
      }
    } else
      fileInputRef.current && fileInputRef.current.removeAttribute("data-article-id");
  }, openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl), setIsImageModalOpen(!0);
  }, closeImageModal = () => {
    setIsImageModalOpen(!1), setSelectedImageUrl(null);
  }, handleDeleteImage = async (articleId, imageUrl) => {
    if (window.confirm("\xCAtes-vous s\xFBr de vouloir supprimer cette image ? Cette action est irr\xE9versible.")) {
      console.log(`Tentative de suppression de l'image: ${imageUrl} pour l'article: ${articleId}`), setDeletingImageUrl(imageUrl), setDeleteError(null), setUploadError(null);
      try {
        await deleteArticleImageUrl(articleId, imageUrl), console.log("Suppression de l'URL dans Firestore r\xE9ussie."), setLocalArticles(
          (prevArticles) => prevArticles.map((art) => {
            if (art.id === articleId) {
              let updatedUrls = (art.imageUrls || []).filter((url) => url !== imageUrl);
              return { ...art, imageUrls: updatedUrls };
            }
            return art;
          })
        );
      } catch (error) {
        console.error("Erreur pendant la suppression de l'URL de l'image:", error), setDeleteError(error.message || "\xC9chec de la suppression de l'image.");
      } finally {
        setDeletingImageUrl(null);
      }
    }
  };
  return /* @__PURE__ */ jsxDEV20("div", { className: "container mx-auto p-4", children: [
    /* @__PURE__ */ jsxDEV20("h1", { className: "text-2xl font-bold mb-4 text-gray-100", children: "Recherche d'Articles" }, void 0, !1, {
      fileName: "app/routes/articles.tsx",
      lineNumber: 229,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV20(Form2, { method: "get", className: "mb-6 p-4 border border-gray-700 rounded-lg shadow-sm bg-jdc-blue-darker", children: /* @__PURE__ */ jsxDEV20("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end", children: [
      /* @__PURE__ */ jsxDEV20("div", { children: [
        /* @__PURE__ */ jsxDEV20("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-300 mb-1", children: "Code Article" }, void 0, !1, {
          fileName: "app/routes/articles.tsx",
          lineNumber: 235,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV20(
          "input",
          {
            type: "text",
            name: "code",
            id: "code",
            value: codeSearch,
            onChange: (e) => setCodeSearch(e.target.value),
            className: "w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400",
            placeholder: "Code exact"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/articles.tsx",
            lineNumber: 238,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 234,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV20("div", { children: [
        /* @__PURE__ */ jsxDEV20("label", { htmlFor: "nom", className: "block text-sm font-medium text-gray-300 mb-1", children: "Nom Article" }, void 0, !1, {
          fileName: "app/routes/articles.tsx",
          lineNumber: 249,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV20(
          "input",
          {
            type: "text",
            name: "nom",
            id: "nom",
            value: nomSearch,
            onChange: (e) => setNomSearch(e.target.value),
            className: "w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400",
            placeholder: "Nom partiel ou complet"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/articles.tsx",
            lineNumber: 252,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 248,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV20("div", { className: "md:pt-6", children: /* @__PURE__ */ jsxDEV20(
        "button",
        {
          type: "submit",
          className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out",
          children: "Rechercher"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/articles.tsx",
          lineNumber: 263,
          columnNumber: 13
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 262,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/articles.tsx",
      lineNumber: 233,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/articles.tsx",
      lineNumber: 232,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV20("div", { className: "bg-jdc-blue-darker p-4 border border-gray-700 rounded-lg shadow-sm", children: [
      /* @__PURE__ */ jsxDEV20("h2", { className: "text-xl font-semibold mb-3 text-gray-200", children: "R\xE9sultats" }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 275,
        columnNumber: 9
      }, this),
      isLoading && /* @__PURE__ */ jsxDEV20("p", { className: "text-gray-400 italic", children: "Chargement des articles..." }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 277,
        columnNumber: 23
      }, this),
      fetchError && !isLoading && /* @__PURE__ */ jsxDEV20("p", { className: "text-red-500 text-sm", children: fetchError }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 278,
        columnNumber: 38
      }, this),
      deleteError && /* @__PURE__ */ jsxDEV20("p", { className: "text-red-500 text-sm mt-2", children: deleteError }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 279,
        columnNumber: 25
      }, this),
      " ",
      !isLoading && !fetchError && /* @__PURE__ */ jsxDEV20(Fragment7, { children: localArticles.length > 0 ? /* @__PURE__ */ jsxDEV20("ul", { className: "divide-y divide-gray-700", children: localArticles.map((article) => {
        let isUploadingCurrent = uploadingImageId === article.id;
        return /* @__PURE__ */ jsxDEV20("li", { className: "py-4 px-1 hover:bg-jdc-gray-800", children: [
          /* @__PURE__ */ jsxDEV20("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxDEV20("div", { children: [
              /* @__PURE__ */ jsxDEV20("p", { className: "font-medium text-gray-100", children: [
                "Code: ",
                article.Code
              ] }, void 0, !0, {
                fileName: "app/routes/articles.tsx",
                lineNumber: 292,
                columnNumber: 27
              }, this),
              /* @__PURE__ */ jsxDEV20("p", { className: "text-sm text-gray-300", children: [
                "D\xE9signation: ",
                article.D\u00E9signation
              ] }, void 0, !0, {
                fileName: "app/routes/articles.tsx",
                lineNumber: 293,
                columnNumber: 27
              }, this),
              article.imageUrls && article.imageUrls.length > 0 && /* @__PURE__ */ jsxDEV20("div", { className: "mt-2 flex flex-wrap gap-2", children: article.imageUrls.map((url, index) => {
                let isDeletingCurrent = deletingImageUrl === url;
                return /* @__PURE__ */ jsxDEV20("div", { className: "relative group", children: [
                  " ",
                  /* @__PURE__ */ jsxDEV20(
                    "img",
                    {
                      src: url,
                      alt: `Image ${index + 1} pour ${article.Code}`,
                      className: `h-16 w-16 object-cover rounded border border-gray-600 transition-opacity ${isDeletingCurrent ? "opacity-50" : "group-hover:opacity-70 cursor-pointer"}`,
                      loading: "lazy",
                      onClick: () => !isDeletingCurrent && openImageModal(url)
                    },
                    void 0,
                    !1,
                    {
                      fileName: "app/routes/articles.tsx",
                      lineNumber: 300,
                      columnNumber: 37
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV20(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation(), handleDeleteImage(article.id, url);
                      },
                      disabled: isDeletingCurrent,
                      className: `absolute top-0 right-0 p-1 bg-red-600 bg-opacity-75 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${isDeletingCurrent ? "cursor-not-allowed opacity-50" : "hover:bg-red-700"}`,
                      "aria-label": "Supprimer l'image",
                      children: isDeletingCurrent ? /* @__PURE__ */ jsxDEV20(FontAwesomeIcon12, { icon: faSpinner8, spin: !0, className: "h-3 w-3" }, void 0, !1, {
                        fileName: "app/routes/articles.tsx",
                        lineNumber: 319,
                        columnNumber: 41
                      }, this) : /* @__PURE__ */ jsxDEV20(FontAwesomeIcon12, { icon: faTrashAlt, className: "h-3 w-3" }, void 0, !1, {
                        fileName: "app/routes/articles.tsx",
                        lineNumber: 321,
                        columnNumber: 41
                      }, this)
                    },
                    void 0,
                    !1,
                    {
                      fileName: "app/routes/articles.tsx",
                      lineNumber: 308,
                      columnNumber: 37
                    },
                    this
                  )
                ] }, index, !0, {
                  fileName: "app/routes/articles.tsx",
                  lineNumber: 299,
                  columnNumber: 35
                }, this);
              }) }, void 0, !1, {
                fileName: "app/routes/articles.tsx",
                lineNumber: 295,
                columnNumber: 29
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/articles.tsx",
              lineNumber: 291,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV20("div", { className: "ml-4 flex-shrink-0", children: /* @__PURE__ */ jsxDEV20(
              "button",
              {
                type: "button",
                onClick: () => handleAddPhotoClick(article.id),
                disabled: isUploadingCurrent,
                className: `inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white ${isUploadingCurrent ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jdc-blue-darker focus:ring-indigo-500"}`,
                children: [
                  isUploadingCurrent ? /* @__PURE__ */ jsxDEV20(FontAwesomeIcon12, { icon: faSpinner8, spin: !0, className: "mr-2" }, void 0, !1, {
                    fileName: "app/routes/articles.tsx",
                    lineNumber: 342,
                    columnNumber: 31
                  }, this) : /* @__PURE__ */ jsxDEV20(FontAwesomeIcon12, { icon: faPlus, className: "-ml-1 mr-2 h-4 w-4", "aria-hidden": "true" }, void 0, !1, {
                    fileName: "app/routes/articles.tsx",
                    lineNumber: 344,
                    columnNumber: 31
                  }, this),
                  /* @__PURE__ */ jsxDEV20("span", { children: isUploadingCurrent ? "Upload..." : "Photo" }, void 0, !1, {
                    fileName: "app/routes/articles.tsx",
                    lineNumber: 346,
                    columnNumber: 29
                  }, this)
                ]
              },
              void 0,
              !0,
              {
                fileName: "app/routes/articles.tsx",
                lineNumber: 331,
                columnNumber: 27
              },
              this
            ) }, void 0, !1, {
              fileName: "app/routes/articles.tsx",
              lineNumber: 330,
              columnNumber: 25
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/articles.tsx",
            lineNumber: 290,
            columnNumber: 23
          }, this),
          uploadError && uploadingImageId === article.id && /* @__PURE__ */ jsxDEV20("p", { className: "text-red-500 text-xs mt-1", children: uploadError }, void 0, !1, {
            fileName: "app/routes/articles.tsx",
            lineNumber: 351,
            columnNumber: 26
          }, this)
        ] }, article.id, !0, {
          fileName: "app/routes/articles.tsx",
          lineNumber: 289,
          columnNumber: 21
        }, this);
      }) }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 285,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV20("p", { className: "text-gray-400 italic", children: [
        searchParams.get("code") || searchParams.get("nom") ? "Aucun article trouv\xE9 pour ces crit\xE8res." : "Effectuez une recherche pour afficher les r\xE9sultats.",
        !user && !loadingAuth && " Veuillez vous connecter pour effectuer une recherche."
      ] }, void 0, !0, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 358,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/articles.tsx",
        lineNumber: 283,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/articles.tsx",
      lineNumber: 274,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV20(
      "input",
      {
        type: "file",
        ref: fileInputRef,
        onChange: handleFileSelected,
        accept: "image/*",
        style: { display: "none" },
        "data-article-id": ""
      },
      void 0,
      !1,
      {
        fileName: "app/routes/articles.tsx",
        lineNumber: 370,
        columnNumber: 7
      },
      this
    ),
    isImageModalOpen && selectedImageUrl && /* @__PURE__ */ jsxDEV20(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4",
        onClick: closeImageModal,
        children: /* @__PURE__ */ jsxDEV20(
          "div",
          {
            className: "relative bg-white p-2 rounded-lg max-w-3xl max-h-[80vh]",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxDEV20(
                "img",
                {
                  src: selectedImageUrl,
                  alt: "Image agrandie",
                  className: "block max-w-full max-h-[calc(80vh-40px)] object-contain"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/articles.tsx",
                  lineNumber: 389,
                  columnNumber: 13
                },
                this
              ),
              /* @__PURE__ */ jsxDEV20(
                "button",
                {
                  onClick: closeImageModal,
                  className: "absolute top-2 right-2 text-black bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 focus:outline-none",
                  "aria-label": "Fermer l'image",
                  children: /* @__PURE__ */ jsxDEV20(FontAwesomeIcon12, { icon: faTimes4, size: "lg" }, void 0, !1, {
                    fileName: "app/routes/articles.tsx",
                    lineNumber: 399,
                    columnNumber: 15
                  }, this)
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/articles.tsx",
                  lineNumber: 394,
                  columnNumber: 13
                },
                this
              )
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/routes/articles.tsx",
            lineNumber: 385,
            columnNumber: 11
          },
          this
        )
      },
      void 0,
      !1,
      {
        fileName: "app/routes/articles.tsx",
        lineNumber: 381,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/articles.tsx",
    lineNumber: 228,
    columnNumber: 5
  }, this);
}

// app/routes/buckets.tsx
var buckets_exports = {};
__export(buckets_exports, {
  default: () => BucketsRoute
});
import { useState as useState14, useEffect as useEffect11 } from "react";
import { jsxDEV as jsxDEV21 } from "react/jsx-dev-runtime";
function BucketsRoute() {
  let [buckets, setBuckets] = useState14([]), [error, setError] = useState14(null), [loading, setLoading] = useState14(!0);
  return useEffect11(() => {
    (async () => {
      try {
        let response = await fetch("/.netlify/functions/google-buckets");
        if (!response.ok)
          throw new Error("HTTP error! status: " + response.status);
        let data = await response.json();
        setBuckets(data.buckets || []);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      } finally {
        setLoading(!1);
      }
    })();
  }, []), loading ? /* @__PURE__ */ jsxDEV21("p", { children: "Chargement des buckets..." }, void 0, !1, {
    fileName: "app/routes/buckets.tsx",
    lineNumber: 28,
    columnNumber: 12
  }, this) : error ? /* @__PURE__ */ jsxDEV21("p", { children: [
    "Erreur: ",
    error.message
  ] }, void 0, !0, {
    fileName: "app/routes/buckets.tsx",
    lineNumber: 32,
    columnNumber: 12
  }, this) : /* @__PURE__ */ jsxDEV21("div", { children: [
    /* @__PURE__ */ jsxDEV21("h1", { children: "Liste des Buckets Google Storage" }, void 0, !1, {
      fileName: "app/routes/buckets.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV21("ul", { children: buckets.map((bucket, index) => /* @__PURE__ */ jsxDEV21("li", { children: bucket }, index, !1, {
      fileName: "app/routes/buckets.tsx",
      lineNumber: 40,
      columnNumber: 11
    }, this)) }, void 0, !1, {
      fileName: "app/routes/buckets.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/buckets.tsx",
    lineNumber: 36,
    columnNumber: 5
  }, this);
}

// app/routes/clients.tsx
var clients_exports = {};
__export(clients_exports, {
  default: () => Clients,
  meta: () => meta4
});
import { jsxDEV as jsxDEV22 } from "react/jsx-dev-runtime";
var meta4 = () => [{ title: "Clients | JDC Dashboard" }];
function Clients() {
  return /* @__PURE__ */ jsxDEV22("div", { children: [
    /* @__PURE__ */ jsxDEV22("h1", { className: "text-2xl font-semibold text-white", children: "Gestion des Clients" }, void 0, !1, {
      fileName: "app/routes/clients.tsx",
      lineNumber: 10,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV22("p", { className: "text-jdc-gray-400 mt-2", children: "Page en construction." }, void 0, !1, {
      fileName: "app/routes/clients.tsx",
      lineNumber: 11,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/clients.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}

// app/routes/logout.ts
var logout_exports = {};
__export(logout_exports, {
  action: () => action3,
  loader: () => loader9
});
import { redirect as redirect5 } from "@remix-run/node";
async function action3({ request }) {
  await authenticator.logout(request, { redirectTo: "/" });
}
async function loader9() {
  return redirect5("/");
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader10
});
import { redirect as redirect6 } from "@remix-run/node";
import { jsxDEV as jsxDEV23 } from "react/jsx-dev-runtime";
var loader10 = async ({ request }) => redirect6("/dashboard");
function Index() {
  return /* @__PURE__ */ jsxDEV23("div", { className: "p-6 text-center", children: /* @__PURE__ */ jsxDEV23("h1", { className: "text-xl text-jdc-gray-300", children: "Redirection vers le tableau de bord..." }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 19,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 18,
    columnNumber: 5
  }, this);
}

// app/routes/admin.tsx
var admin_exports = {};
__export(admin_exports, {
  default: () => AdminPanel
});
import { useEffect as useEffect13, useState as useState16, useCallback as useCallback8 } from "react";
import { useOutletContext as useOutletContext5, Link as Link7 } from "@remix-run/react";

// app/components/ui/Card.tsx
import { jsxDEV as jsxDEV24 } from "react/jsx-dev-runtime";
var Card = ({ children, className = "", as = "div" }) => /* @__PURE__ */ jsxDEV24(as, { className: `bg-jdc-card rounded-lg shadow-lg overflow-hidden transition duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl ${className}`, children }, void 0, !1, {
  fileName: "app/components/ui/Card.tsx",
  lineNumber: 15,
  columnNumber: 5
}, this), CardHeader = ({ children, className = "" }) => /* @__PURE__ */ jsxDEV24("div", { className: `px-4 py-3 sm:px-6 border-b border-jdc-gray-800 ${className}`, children }, void 0, !1, {
  fileName: "app/components/ui/Card.tsx",
  lineNumber: 29,
  columnNumber: 10
}, this), CardBody = ({ children, className = "" }) => /* @__PURE__ */ jsxDEV24("div", { className: `px-4 py-4 sm:p-6 ${className}`, children }, void 0, !1, {
  fileName: "app/components/ui/Card.tsx",
  lineNumber: 34,
  columnNumber: 10
}, this);

// app/components/EditUserModal.tsx
import { useState as useState15, useEffect as useEffect12 } from "react";

// app/components/ui/Select.tsx
import { jsxDEV as jsxDEV25 } from "react/jsx-dev-runtime";
var Select = ({
  label,
  id,
  name,
  options,
  value,
  onChange,
  disabled,
  required,
  error,
  className = "",
  containerClassName = "",
  ...props
}) => {
  let baseStyle = "block w-full px-3 py-2 bg-jdc-gray-800 border border-jdc-gray-700 rounded-md shadow-sm placeholder-jdc-gray-500 focus:outline-none focus:ring-jdc-yellow focus:border-jdc-yellow sm:text-sm text-white disabled:opacity-50", errorStyle = error ? "border-red-500 ring-red-500" : "border-jdc-gray-700";
  return /* @__PURE__ */ jsxDEV25("div", { className: `mb-4 ${containerClassName}`, children: [
    label && /* @__PURE__ */ jsxDEV25("label", { htmlFor: id || name, className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
      label,
      " ",
      required && /* @__PURE__ */ jsxDEV25("span", { className: "text-red-500", children: "*" }, void 0, !1, {
        fileName: "app/components/ui/Select.tsx",
        lineNumber: 36,
        columnNumber: 32
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ui/Select.tsx",
      lineNumber: 35,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV25(
      "select",
      {
        id: id || name,
        name,
        value,
        onChange,
        disabled,
        required,
        className: `${baseStyle} ${errorStyle} ${className}`,
        ...props,
        children: options.map((option) => /* @__PURE__ */ jsxDEV25("option", { value: option.value, children: option.label }, option.value, !1, {
          fileName: "app/components/ui/Select.tsx",
          lineNumber: 52,
          columnNumber: 11
        }, this))
      },
      void 0,
      !1,
      {
        fileName: "app/components/ui/Select.tsx",
        lineNumber: 39,
        columnNumber: 7
      },
      this
    ),
    error && /* @__PURE__ */ jsxDEV25("p", { className: "mt-1 text-sm text-red-400", children: error }, void 0, !1, {
      fileName: "app/components/ui/Select.tsx",
      lineNumber: 57,
      columnNumber: 17
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/ui/Select.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
};

// app/components/EditUserModal.tsx
import { jsxDEV as jsxDEV26 } from "react/jsx-dev-runtime";
var DEFAULT_ROLES = ["Admin", "Technician", "Viewer"], DEFAULT_SECTORS = ["CHR", "HACCP", "Kezia", "Tabac"], EditUserModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  availableRoles = DEFAULT_ROLES,
  availableSectors = DEFAULT_SECTORS
  // Use passed or default sectors
}) => {
  let [formData, setFormData] = useState15({}), [isSaving, setIsSaving] = useState15(!1), [error, setError] = useState15(null);
  useEffect12(() => {
    user && isOpen ? (setFormData({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      role: user.role || "Technician",
      secteurs: user.secteurs || []
      // Initialize with current sectors
    }), setError(null)) : isOpen || (setFormData({}), setIsSaving(!1), setError(null));
  }, [user, isOpen]);
  let handleChange = (e) => {
    let { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, handleSectorToggle = (sector) => {
    setFormData((prev) => {
      let currentSectors = prev.secteurs || [], isSelected = currentSectors.includes(sector), newSectors;
      return isSelected ? newSectors = currentSectors.filter((s) => s !== sector) : newSectors = [...currentSectors, sector], { ...prev, secteurs: newSectors };
    });
  }, handleSubmit = async (e) => {
    if (e.preventDefault(), !user)
      return;
    setIsSaving(!0), setError(null);
    let updatedUserData = {
      ...user,
      // Start with original user data
      displayName: formData.displayName || user.displayName,
      role: formData.role || user.role,
      secteurs: formData.secteurs || [],
      // Use the updated sectors array
      uid: user.uid,
      email: user.email
    };
    try {
      await onSave(updatedUserData);
    } catch (err) {
      console.error("Error saving user:", err), setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(!1);
    }
  };
  if (!isOpen || !user)
    return null;
  let roleOptions = availableRoles.map((role) => ({ value: role, label: role })), currentSelectedSectors = formData.secteurs || [];
  return /* @__PURE__ */ jsxDEV26("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out", children: /* @__PURE__ */ jsxDEV26("div", { className: "bg-jdc-card rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100", children: [
    /* @__PURE__ */ jsxDEV26("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxDEV26("h2", { className: "text-xl font-semibold text-white", children: "Modifier l'utilisateur" }, void 0, !1, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 113,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV26("button", { onClick: onClose, className: "text-jdc-gray-400 hover:text-white", disabled: isSaving, children: "\xD7" }, void 0, !1, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 114,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/EditUserModal.tsx",
      lineNumber: 112,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV26("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV26("div", { children: [
        /* @__PURE__ */ jsxDEV26("label", { className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: "Email" }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 122,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV26("p", { className: "text-sm text-white bg-jdc-gray-800 px-3 py-2 rounded", children: formData.email }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 123,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 121,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV26(
        Input,
        {
          label: "Nom d'affichage",
          id: "displayName",
          name: "displayName",
          value: formData.displayName || "",
          onChange: handleChange,
          disabled: isSaving,
          placeholder: "Nom affich\xE9 dans l'application"
        },
        void 0,
        !1,
        {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 127,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV26(
        Select,
        {
          label: "R\xF4le",
          id: "role",
          name: "role",
          options: roleOptions,
          value: formData.role || "",
          onChange: handleChange,
          disabled: isSaving,
          required: !0
        },
        void 0,
        !1,
        {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 138,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV26("div", { children: [
        /* @__PURE__ */ jsxDEV26("label", { className: "block text-sm font-medium text-jdc-gray-300 mb-2", children: "Secteurs" }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 151,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV26("div", { className: "flex flex-wrap gap-2", children: availableSectors.map((sector) => {
          let isSelected = currentSelectedSectors.includes(sector);
          return /* @__PURE__ */ jsxDEV26(
            Button,
            {
              type: "button",
              variant: isSelected ? "primary" : "secondary",
              size: "sm",
              onClick: () => handleSectorToggle(sector),
              disabled: isSaving,
              className: `transition-colors duration-150 ${isSelected ? "" : "opacity-70 hover:opacity-100"}`,
              children: sector
            },
            sector,
            !1,
            {
              fileName: "app/components/EditUserModal.tsx",
              lineNumber: 156,
              columnNumber: 19
            },
            this
          );
        }) }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 152,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 150,
        columnNumber: 11
      }, this),
      error && /* @__PURE__ */ jsxDEV26("p", { className: "text-sm text-red-400 mt-2", children: error }, void 0, !1, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 172,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV26("div", { className: "flex justify-end space-x-3 pt-4", children: [
        /* @__PURE__ */ jsxDEV26(Button, { type: "button", variant: "secondary", onClick: onClose, disabled: isSaving, children: "Annuler" }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 175,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV26(Button, { type: "submit", variant: "primary", isLoading: isSaving, disabled: isSaving, children: "Enregistrer" }, void 0, !1, {
          fileName: "app/components/EditUserModal.tsx",
          lineNumber: 178,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/EditUserModal.tsx",
        lineNumber: 174,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/EditUserModal.tsx",
      lineNumber: 119,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/EditUserModal.tsx",
    lineNumber: 111,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/EditUserModal.tsx",
    lineNumber: 110,
    columnNumber: 5
  }, this);
};

// app/routes/admin.tsx
init_firestore_service_server();
import { jsxDEV as jsxDEV27 } from "react/jsx-dev-runtime";
var AVAILABLE_SECTORS = ["CHR", "HACCP", "Kezia", "Tabac"], AVAILABLE_ROLES = ["Admin", "Technician", "Viewer"];
function AdminPanel() {
  let { user, profile, loadingAuth } = useOutletContext5(), { addToast } = useToast(), [isAuthorized, setIsAuthorized] = useState16(null), [users, setUsers] = useState16([]), [loadingUsers, setLoadingUsers] = useState16(!1), [errorUsers, setErrorUsers] = useState16(null), [isEditModalOpen, setIsEditModalOpen] = useState16(!1), [editingUser, setEditingUser] = useState16(null);
  useEffect13(() => {
    if (loadingAuth) {
      setIsAuthorized(null);
      return;
    }
    let isAdmin = user && profile?.role?.toLowerCase() === "admin";
    setIsAuthorized(isAdmin);
  }, [user, profile, loadingAuth]);
  let fetchUsers = useCallback8(async () => {
    console.log("[AdminPanel] Fetching user list..."), setLoadingUsers(!0), setErrorUsers(null);
    try {
      let fetchedUsers = await getAllUserProfilesSdk();
      console.log("[AdminPanel] User list fetched successfully:", fetchedUsers), setUsers(fetchedUsers);
    } catch (error) {
      console.error("[AdminPanel] Error fetching user list:", error);
      let errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setErrorUsers(`Impossible de charger la liste des utilisateurs: ${errorMessage}. V\xE9rifiez les permissions Firestore ou la console.`), addToast({ type: "error", message: "Erreur lors du chargement des utilisateurs." });
    } finally {
      setLoadingUsers(!1);
    }
  }, [addToast]);
  useEffect13(() => {
    isAuthorized === !0 ? fetchUsers() : isAuthorized === !1 && setUsers([]);
  }, [isAuthorized, fetchUsers]);
  let handleOpenEditModal = (userToEdit) => {
    console.log("[AdminPanel] Opening edit modal for user:", userToEdit.uid), setEditingUser(userToEdit), setIsEditModalOpen(!0);
  }, handleCloseEditModal = () => {
    console.log("[AdminPanel] Closing edit modal."), setIsEditModalOpen(!1), setEditingUser(null);
  }, handleSaveUser = async (updatedUser) => {
    if (!editingUser)
      return;
    console.log("[AdminPanel] Attempting to save user (client-side):", updatedUser.uid, updatedUser);
    let dataToUpdate = {};
    updatedUser.displayName !== editingUser.displayName && (dataToUpdate.displayName = updatedUser.displayName), updatedUser.role !== editingUser.role && (dataToUpdate.role = updatedUser.role);
    let sortedCurrentSectors = [...editingUser.secteurs || []].sort(), sortedUpdatedSectors = [...updatedUser.secteurs || []].sort();
    if (JSON.stringify(sortedCurrentSectors) !== JSON.stringify(sortedUpdatedSectors) && (dataToUpdate.secteurs = updatedUser.secteurs || []), Object.keys(dataToUpdate).length === 0) {
      addToast({ type: "info", message: "Aucune modification d\xE9tect\xE9e." }), handleCloseEditModal();
      return;
    }
    try {
      await updateUserProfileSdk(editingUser.uid, dataToUpdate), addToast({ type: "success", message: "Utilisateur mis \xE0 jour avec succ\xE8s." }), handleCloseEditModal(), fetchUsers();
    } catch (error) {
      console.error("[AdminPanel] Error saving user (client-side SDK):", error);
      let errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      throw addToast({ type: "error", message: `Erreur lors de la mise \xE0 jour : ${errorMessage}` }), error;
    }
  };
  return loadingAuth || isAuthorized === null ? /* @__PURE__ */ jsxDEV27("div", { className: "flex justify-center items-center h-64", children: /* @__PURE__ */ jsxDEV27("p", { className: "text-jdc-gray-400 animate-pulse", children: "V\xE9rification de l'acc\xE8s..." }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 133,
    columnNumber: 67
  }, this) }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 133,
    columnNumber: 12
  }, this) : isAuthorized ? /* @__PURE__ */ jsxDEV27("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxDEV27("h1", { className: "text-3xl font-bold text-white mb-6", children: "Panneau d'Administration" }, void 0, !1, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 148,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV27(Card, { children: [
      /* @__PURE__ */ jsxDEV27(CardHeader, { children: /* @__PURE__ */ jsxDEV27("h2", { className: "text-lg font-medium text-white", children: "Informations Administrateur" }, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 152,
        columnNumber: 21
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 152,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV27(CardBody, { children: [
        /* @__PURE__ */ jsxDEV27("p", { className: "text-jdc-gray-300", children: [
          "Connect\xE9 en tant que : ",
          /* @__PURE__ */ jsxDEV27("span", { className: "font-medium text-white", children: profile?.email }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 154,
            columnNumber: 69
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 154,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV27("p", { className: "text-jdc-gray-300", children: [
          "R\xF4le : ",
          /* @__PURE__ */ jsxDEV27("span", { className: "font-medium text-white", children: profile?.role }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 155,
            columnNumber: 53
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 155,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 153,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 151,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV27(Card, { children: [
      /* @__PURE__ */ jsxDEV27(CardHeader, { children: [
        /* @__PURE__ */ jsxDEV27("h2", { className: "text-lg font-medium text-white", children: "Gestion des Utilisateurs Existants" }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 166,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV27("p", { className: "mt-1 text-sm text-jdc-gray-400", children: "Modifier les r\xF4les et les secteurs des utilisateurs." }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 167,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 165,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV27(CardBody, { children: [
        /* @__PURE__ */ jsxDEV27("div", { className: "bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-4", role: "alert", children: [
          /* @__PURE__ */ jsxDEV27("strong", { className: "font-bold", children: "Attention S\xE9curit\xE9 ! " }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 171,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV27("span", { className: "block sm:inline", children: "La modification des utilisateurs est effectu\xE9e c\xF4t\xE9 client via SDK. Ceci est INSECURIS\xC9 pour les op\xE9rations sensibles (changement de r\xF4le admin) et doit \xEAtre remplac\xE9 par des fonctions backend s\xE9curis\xE9es (ex: Cloud Functions) \xE0 terme." }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 172,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 170,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV27("div", { className: "bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded relative mb-4", role: "alert", children: [
          /* @__PURE__ */ jsxDEV27("strong", { className: "font-bold", children: "Info : " }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 175,
            columnNumber: 14
          }, this),
          /* @__PURE__ */ jsxDEV27("span", { className: "block sm:inline", children: 'La cr\xE9ation de nouveaux utilisateurs se fait d\xE9sormais via la fen\xEAtre de connexion (bouton "Cr\xE9er un compte").' }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 176,
            columnNumber: 14
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 174,
          columnNumber: 12
        }, this),
        loadingUsers && /* @__PURE__ */ jsxDEV27("div", { className: "text-center py-4", children: /* @__PURE__ */ jsxDEV27("p", { className: "text-jdc-gray-400 animate-pulse", children: "Chargement de la liste..." }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 179,
          columnNumber: 62
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 179,
          columnNumber: 28
        }, this),
        errorUsers && !loadingUsers && /* @__PURE__ */ jsxDEV27("div", { className: "text-center py-4 text-red-400", children: /* @__PURE__ */ jsxDEV27("p", { children: errorUsers }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 180,
          columnNumber: 90
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 180,
          columnNumber: 43
        }, this),
        !loadingUsers && !errorUsers && users.length > 0 && /* @__PURE__ */ jsxDEV27("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV27("table", { className: "min-w-full divide-y divide-jdc-gray-700", children: [
          /* @__PURE__ */ jsxDEV27("thead", { className: "bg-jdc-gray-800/50", children: /* @__PURE__ */ jsxDEV27("tr", { children: [
            /* @__PURE__ */ jsxDEV27("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Nom" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 187,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV27("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Email" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 188,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV27("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "R\xF4le" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 189,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV27("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Secteurs" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 190,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV27("th", { className: "relative px-6 py-3", children: /* @__PURE__ */ jsxDEV27("span", { className: "sr-only", children: "Actions" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 191,
              columnNumber: 56
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 191,
              columnNumber: 21
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 186,
            columnNumber: 19
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 185,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV27("tbody", { className: "bg-jdc-card divide-y divide-jdc-gray-700", children: users.map((u) => /* @__PURE__ */ jsxDEV27("tr", { children: [
            /* @__PURE__ */ jsxDEV27("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-white", children: u.displayName || /* @__PURE__ */ jsxDEV27("i", { className: "text-jdc-gray-500", children: "Non d\xE9fini" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 197,
              columnNumber: 116
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 197,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV27("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: u.email }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 198,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV27("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: u.role }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 199,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV27("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: u.secteurs?.join(", ") || /* @__PURE__ */ jsxDEV27("i", { className: "text-jdc-gray-500", children: "Aucun" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 200,
              columnNumber: 120
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 200,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV27("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxDEV27(
              Button,
              {
                variant: "secondary",
                size: "sm",
                onClick: () => handleOpenEditModal(u),
                children: "Modifier"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 202,
                columnNumber: 25
              },
              this
            ) }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 201,
              columnNumber: 23
            }, this)
          ] }, u.uid, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 196,
            columnNumber: 21
          }, this)) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 194,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 184,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 183,
          columnNumber: 13
        }, this),
        !loadingUsers && !errorUsers && users.length === 0 && /* @__PURE__ */ jsxDEV27("div", { className: "text-center py-4 text-jdc-gray-400", children: /* @__PURE__ */ jsxDEV27("p", { children: "Aucun utilisateur trouv\xE9." }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 220,
          columnNumber: 65
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 220,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 169,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 164,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV27(
      EditUserModal,
      {
        isOpen: isEditModalOpen,
        onClose: handleCloseEditModal,
        user: editingUser,
        onSave: handleSaveUser,
        availableRoles: AVAILABLE_ROLES,
        availableSectors: AVAILABLE_SECTORS
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin.tsx",
        lineNumber: 226,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 147,
    columnNumber: 5
  }, this) : /* @__PURE__ */ jsxDEV27("div", { className: "text-center py-10", children: [
    /* @__PURE__ */ jsxDEV27("h1", { className: "text-2xl font-bold text-red-500 mb-4", children: "Acc\xE8s Refus\xE9" }, void 0, !1, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 139,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV27("p", { className: "text-jdc-gray-300", children: "Vous n'avez pas les permissions n\xE9cessaires." }, void 0, !1, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 140,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV27(Link7, { to: "/dashboard", className: "text-jdc-yellow hover:underline mt-4 inline-block", children: "Retour au tableau de bord" }, void 0, !1, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 141,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 138,
    columnNumber: 7
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-3QKQLRXO.js", imports: ["/build/_shared/chunk-O4BRYNJ4.js", "/build/_shared/chunk-AMVBX4XI.js", "/build/_shared/chunk-U4FRFQSK.js", "/build/_shared/chunk-KHF7YLN5.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-XGOTYLZ5.js", "/build/_shared/chunk-7M6SC7J5.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-V35BV476.js", imports: ["/build/_shared/chunk-SQW27RMA.js", "/build/_shared/chunk-BZ5ICFE4.js", "/build/_shared/chunk-G7CHZRZX.js", "/build/_shared/chunk-BURQIT5W.js", "/build/_shared/chunk-MWBBKACI.js", "/build/_shared/chunk-EX27AVCS.js", "/build/_shared/chunk-PYKMED4Y.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-ID7FZHJM.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin": { id: "routes/admin", parentId: "root", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/admin-FZ3EWPJC.js", imports: ["/build/_shared/chunk-OLCCHEF4.js", "/build/_shared/chunk-YVC54CLU.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.health": { id: "routes/api.health", parentId: "root", path: "api/health", index: void 0, caseSensitive: void 0, module: "/build/routes/api.health-H34JQDK4.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/articles": { id: "routes/articles", parentId: "root", path: "articles", index: void 0, caseSensitive: void 0, module: "/build/routes/articles-GRTDOJVY.js", imports: ["/build/_shared/chunk-YVC54CLU.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.google": { id: "routes/auth.google", parentId: "root", path: "auth/google", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.google-OG6QF3LO.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.google.callback": { id: "routes/auth.google.callback", parentId: "routes/auth.google", path: "callback", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.google.callback-6OVSUAP3.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/buckets": { id: "routes/buckets", parentId: "root", path: "buckets", index: void 0, caseSensitive: void 0, module: "/build/routes/buckets-YPBNV7QM.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/clients": { id: "routes/clients", parentId: "root", path: "clients", index: void 0, caseSensitive: void 0, module: "/build/routes/clients-SFYKGVPT.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/dashboard": { id: "routes/dashboard", parentId: "root", path: "dashboard", index: void 0, caseSensitive: void 0, module: "/build/routes/dashboard-AUVLNUDW.js", imports: ["/build/_shared/chunk-QJLF2KKE.js", "/build/_shared/chunk-BGEWULVP.js", "/build/_shared/chunk-YVC54CLU.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/envois-ctn": { id: "routes/envois-ctn", parentId: "root", path: "envois-ctn", index: void 0, caseSensitive: void 0, module: "/build/routes/envois-ctn-B4UT7XKX.js", imports: ["/build/_shared/chunk-NMKEOK6V.js", "/build/_shared/chunk-OLCCHEF4.js", "/build/_shared/chunk-YVC54CLU.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/google-drive-files": { id: "routes/google-drive-files", parentId: "root", path: "google-drive-files", index: void 0, caseSensitive: void 0, module: "/build/routes/google-drive-files-7UIJ4Z7T.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/installations.kezia": { id: "routes/installations.kezia", parentId: "root", path: "installations/kezia", index: void 0, caseSensitive: void 0, module: "/build/routes/installations.kezia-AMIQNSQI.js", imports: ["/build/_shared/chunk-QJLF2KKE.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/logout": { id: "routes/logout", parentId: "root", path: "logout", index: void 0, caseSensitive: void 0, module: "/build/routes/logout-MMH6Q26W.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/tickets-sap": { id: "routes/tickets-sap", parentId: "root", path: "tickets-sap", index: void 0, caseSensitive: void 0, module: "/build/routes/tickets-sap-DKWDTN4W.js", imports: ["/build/_shared/chunk-B43JI2TA.js", "/build/_shared/chunk-NMKEOK6V.js", "/build/_shared/chunk-BGEWULVP.js", "/build/_shared/chunk-OLCCHEF4.js", "/build/_shared/chunk-YVC54CLU.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "2a56f049", hmr: { runtime: "/build/_shared\\chunk-KHF7YLN5.js", timestamp: 1744574305617 }, url: "/build/manifest-2A56F049.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public\\build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/auth.google.callback": {
    id: "routes/auth.google.callback",
    parentId: "routes/auth.google",
    path: "callback",
    index: void 0,
    caseSensitive: void 0,
    module: auth_google_callback_exports
  },
  "routes/installations.kezia": {
    id: "routes/installations.kezia",
    parentId: "root",
    path: "installations/kezia",
    index: void 0,
    caseSensitive: void 0,
    module: installations_kezia_exports
  },
  "routes/google-drive-files": {
    id: "routes/google-drive-files",
    parentId: "root",
    path: "google-drive-files",
    index: void 0,
    caseSensitive: void 0,
    module: google_drive_files_exports
  },
  "routes/auth.google": {
    id: "routes/auth.google",
    parentId: "root",
    path: "auth/google",
    index: void 0,
    caseSensitive: void 0,
    module: auth_google_exports
  },
  "routes/tickets-sap": {
    id: "routes/tickets-sap",
    parentId: "root",
    path: "tickets-sap",
    index: void 0,
    caseSensitive: void 0,
    module: tickets_sap_exports
  },
  "routes/api.health": {
    id: "routes/api.health",
    parentId: "root",
    path: "api/health",
    index: void 0,
    caseSensitive: void 0,
    module: api_health_exports
  },
  "routes/envois-ctn": {
    id: "routes/envois-ctn",
    parentId: "root",
    path: "envois-ctn",
    index: void 0,
    caseSensitive: void 0,
    module: envois_ctn_exports
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: dashboard_exports
  },
  "routes/articles": {
    id: "routes/articles",
    parentId: "root",
    path: "articles",
    index: void 0,
    caseSensitive: void 0,
    module: articles_exports
  },
  "routes/buckets": {
    id: "routes/buckets",
    parentId: "root",
    path: "buckets",
    index: void 0,
    caseSensitive: void 0,
    module: buckets_exports
  },
  "routes/clients": {
    id: "routes/clients",
    parentId: "root",
    path: "clients",
    index: void 0,
    caseSensitive: void 0,
    module: clients_exports
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: logout_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: admin_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
//# sourceMappingURL=index.js.map
