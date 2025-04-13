import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile, // Renamed to avoid conflict
  GoogleAuthProvider, // Import Google provider
  signInWithPopup, // Import popup sign-in method
  type User as FirebaseUser,
  type AuthError
} from "firebase/auth";
import { auth } from "~/firebase.config"; // Use the initialized auth instance
import { createUserProfileSdk, getUserProfileSdk } from "./firestore.service.server"; // Import profile creation AND fetching
import type { UserProfile } from "~/types/firestore.types"; // Import UserProfile type

// Define a simpler User type for our app state
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null; // Add other relevant fields if needed
}

// --- Map Firebase User to App User ---
const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser): AppUser => {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
    };
};

// --- Login ---
export const signIn = async (email: string, password: string): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToAppUser(userCredential.user);
  } catch (error) {
    console.error("Firebase Sign In Error:", error);
    const authError = error as AuthError;
    if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
       throw new Error("Email ou mot de passe incorrect.");
    } else if (authError.code === 'auth/invalid-email') {
        throw new Error("Format d'email invalide.");
    }
    throw new Error("Erreur de connexion. Veuillez réessayer.");
  }
};

// --- Logout ---
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Firebase Sign Out Error:", error);
    throw new Error("Erreur lors de la déconnexion.");
  }
};

// --- Sign Up and Create Profile (Email/Password) ---
export const signUpAndCreateProfile = async (email: string, password: string, displayName: string): Promise<UserProfile> => {
  let firebaseUser: FirebaseUser | null = null;

  try {
    // Step 1: Create user in Firebase Authentication
    console.log(`[AuthService] Attempting to create Auth user for: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;
    console.log(`[AuthService] Auth user created successfully: ${firebaseUser.uid}`);

    // Step 1.5: Update Firebase Auth profile display name (optional but good practice)
    try {
        await updateFirebaseProfile(firebaseUser, { displayName: displayName });
        console.log(`[AuthService] Firebase Auth profile display name updated for: ${firebaseUser.uid}`);
    } catch (updateError) {
        console.warn(`[AuthService] Could not update Firebase Auth display name for ${firebaseUser.uid}:`, updateError);
        // Non-critical, continue with Firestore profile creation
    }

    // Step 2: Create user profile document in Firestore
    console.log(`[AuthService] Attempting to create Firestore profile for: ${firebaseUser.uid}`);
    const newUserProfile = await createUserProfileSdk(
        firebaseUser.uid,
        firebaseUser.email!, // Email is guaranteed non-null after successful creation
        displayName,
        'Technician' // Default role
    );
    console.log(`[AuthService] Firestore profile created successfully for: ${firebaseUser.uid}`);

    return newUserProfile;

  } catch (error) {
    console.error("[AuthService] Error during sign up or profile creation:", error);
    const authError = error as AuthError;

    if (authError.code === 'auth/email-already-in-use') {
      throw new Error("Cette adresse email est déjà utilisée.");
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error("Format d'email invalide.");
    } else if (authError.code === 'auth/weak-password') {
      throw new Error("Le mot de passe est trop faible (minimum 6 caractères).");
    } else if (error instanceof Error && error.message.includes("Firestore")) {
        console.warn(`[AuthService] Auth user ${firebaseUser?.uid} created, but Firestore profile failed.`);
        // Consider deleting the Auth user here in production if profile creation is critical
        // await firebaseUser?.delete();
        throw new Error(`Erreur lors de la création du profil: ${error.message}`);
    }
    throw new Error("Erreur lors de la création du compte. Veuillez réessayer.");
  }
};

// --- Sign In with Google ---
export const signInWithGoogle = async (): Promise<AppUser> => {
  const provider = new GoogleAuthProvider();
  try {
    console.log("[AuthService] Attempting Google Sign-In Popup...");
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    console.log(`[AuthService] Google Sign-In successful for: ${firebaseUser.uid} (${firebaseUser.email})`);

    // Check if Firestore profile exists, create if not
    try {
      console.log(`[AuthService] Checking for existing Firestore profile for: ${firebaseUser.uid}`);
      await getUserProfileSdk(firebaseUser.uid);
      console.log(`[AuthService] Firestore profile found for: ${firebaseUser.uid}`);
    } catch (profileError: any) {
      // Assuming 'profileError' indicates "not found" (adjust if getUserProfileSdk throws differently)
      // A more robust check might involve checking error codes if available
      if (profileError.message?.includes("not found") || profileError.code === 'not-found') { // Example check
          console.log(`[AuthService] No Firestore profile found for ${firebaseUser.uid}. Creating one...`);
          try {
              await createUserProfileSdk(
                  firebaseUser.uid,
                  firebaseUser.email || `no-email-${firebaseUser.uid}@example.com`, // Provide fallback email if null
                  firebaseUser.displayName || "Utilisateur Google", // Use Google display name or fallback
                  'Technician' // Default role for new Google users
              );
              console.log(`[AuthService] Firestore profile created successfully for Google user: ${firebaseUser.uid}`);
          } catch (creationError) {
              console.error(`[AuthService] CRITICAL: Failed to create Firestore profile for Google user ${firebaseUser.uid} after successful auth:`, creationError);
              // Decide how to handle this: sign out the user? Show an error?
              // For now, we'll let the sign-in proceed but log the critical failure.
              // throw new Error("Erreur lors de la finalisation de l'inscription Google."); // Option to throw
          }
      } else {
          // Rethrow unexpected errors during profile check
          console.error(`[AuthService] Error checking Firestore profile for ${firebaseUser.uid}:`, profileError);
          throw new Error("Erreur lors de la vérification du profil utilisateur.");
      }
    }

    return mapFirebaseUserToAppUser(firebaseUser);

  } catch (error) {
    console.error("[AuthService] Google Sign In Error:", error);
    const authError = error as AuthError;
    if (authError.code === 'auth/popup-closed-by-user') {
      throw new Error("Connexion Google annulée.");
    } else if (authError.code === 'auth/account-exists-with-different-credential') {
      throw new Error("Un compte existe déjà avec cet email mais avec une méthode de connexion différente.");
      // TODO: Consider implementing account linking flow here if needed
    } else if (authError.code === 'auth/cancelled-popup-request') {
        throw new Error("Multiples tentatives de connexion Google détectées. Veuillez réessayer.");
    }
    // Add other specific Google error codes if needed
    throw new Error("Erreur lors de la connexion avec Google. Veuillez réessayer.");
  }
};


// --- Auth State Listener ---
export const listenToAuthState = (callback: (user: AppUser | null) => void): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // User is signed in, map to AppUser
      // We rely on the initial sign-in/sign-up logic (including Google)
      // to ensure the Firestore profile exists.
      // The displayName here might be from Firebase Auth, which could be updated
      // slightly after Firestore profile creation/update. The root loader
      // fetching the Firestore profile is the source of truth for display name in the app.
      const appUser = mapFirebaseUserToAppUser(firebaseUser);
      callback(appUser);
    } else {
      // User is signed out
      callback(null);
    }
  });

  return unsubscribe; // Return the unsubscribe function for cleanup
};
