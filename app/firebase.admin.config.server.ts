import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, applicationDefault } from 'firebase-admin/app'; // Import applicationDefault
import fs from "fs"; // Import fs for file writing
import path from "path"; // Import path for joining paths

let dbAdmin: admin.firestore.Firestore;
const TEMP_CREDENTIALS_PATH = "/tmp/firebase-service-account.json"; // Define path for temp file

// --- Netlify Credentials Handling ---
// Check if running on Netlify and BASE64 credentials are provided
if (process.env.NETLIFY && process.env.GOOGLE_CREDENTIALS_BASE64) {
  console.log("[FirebaseAdminConfig] Netlify environment detected with BASE64 credentials. Writing to temp file...");
  try {
    // Decode Base64 string and write to the /tmp directory (writable on Netlify)
    fs.writeFileSync(
      TEMP_CREDENTIALS_PATH,
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf-8")
    );
    // Set the GOOGLE_APPLICATION_CREDENTIALS env var to point to the created file
    process.env.GOOGLE_APPLICATION_CREDENTIALS = TEMP_CREDENTIALS_PATH;
    console.log(`[FirebaseAdminConfig] Credentials written to ${TEMP_CREDENTIALS_PATH} and GOOGLE_APPLICATION_CREDENTIALS set.`);
  } catch (error) {
    console.error("[FirebaseAdminConfig] CRITICAL: Failed to write temporary credentials file from BASE64:", error);
    // Throw error to prevent initialization with potentially missing credentials
    throw new Error("Failed to process BASE64 credentials for Firebase Admin SDK");
  }
}
// --- End Netlify Credentials Handling ---


// Simplified Initialization: Initialize only if no apps exist.
if (getAdminApps().length === 0) {
  console.log("[FirebaseAdminConfig] No existing apps found. Initializing Firebase Admin SDK...");
  try {
    // Check if credentials path is set (either locally via .env or via BASE64 logic above)
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn("[FirebaseAdminConfig] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Admin SDK might not authenticate properly.");
        // Consider throwing an error here if credentials are strictly required
        // throw new Error("GOOGLE_APPLICATION_CREDENTIALS must be set.");
    }
    // Initialize using applicationDefault(), which reads the GOOGLE_APPLICATION_CREDENTIALS env var
    initializeAdminApp({
        credential: applicationDefault(),
    });
    console.log("[FirebaseAdminConfig] Firebase Admin SDK initialized successfully using applicationDefault().");
  } catch (error) {
    console.error("[FirebaseAdminConfig] CRITICAL: Failed to initialize Firebase Admin SDK:", error);
    // Throw error to prevent app from starting incorrectly
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
} else {
  console.log("[FirebaseAdminConfig] Firebase Admin SDK already initialized.");
}

// Always try to get the Firestore instance from the default app.
// This should work whether the app was just initialized or already existed.
try {
    dbAdmin = getAdminFirestore();
} catch (error) {
     console.error("[FirebaseAdminConfig] CRITICAL: Failed to get Firestore instance from Admin SDK:", error);
     // Provide a fallback or throw an error
     throw new Error("Failed to get Firestore instance from Admin SDK. Ensure initialization succeeded.");
}

export { dbAdmin };
