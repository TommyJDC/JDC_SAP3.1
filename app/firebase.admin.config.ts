import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';

let dbAdmin: admin.firestore.Firestore;

// Simplified Initialization: Initialize only if no apps exist.
// initializeApp handles idempotency if called multiple times with default config.
if (getAdminApps().length === 0) {
  console.log("[FirebaseAdminConfig] No existing apps found. Initializing Firebase Admin SDK...");
  try {
    // Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your .env or environment
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn("[FirebaseAdminConfig] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Admin SDK might not authenticate properly.");
    }
    // Initialize the default app without explicit credentials, relying on the env var
    initializeAdminApp();
    console.log("[FirebaseAdminConfig] Firebase Admin SDK initialized successfully.");
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
