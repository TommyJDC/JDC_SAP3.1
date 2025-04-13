import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage, type UserSession } from "./session.server"; // Import session storage and type
import { getUserProfileSdk, createUserProfileSdk } from "./firestore.service"; // Import Firestore functions

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<UserSession>(sessionStorage, {
  // Throw errors instead of redirecting to `/login` on failure
  throwOnError: true,
});

// Ensure environment variables are set
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appBaseUrl = process.env.APP_BASE_URL;

if (!googleClientId || !googleClientSecret || !appBaseUrl) {
  throw new Error(
    "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and APP_BASE_URL must be set in .env"
  );
}

const googleCallbackUrl = `${appBaseUrl}/auth/google/callback`;

// Define the Google Strategy
authenticator.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      // Define the scopes needed for Google APIs
      // Ensure these scopes are enabled in your Google Cloud Console project
      scope: [
        "openid", // Required for OpenID Connect
        "email", // Get user's email address
        "profile", // Get user's basic profile info (name, picture)
        "https://www.googleapis.com/auth/drive", // Full access to Drive (adjust if needed)
        "https://www.googleapis.com/auth/calendar", // Full access to Calendar (adjust if needed)
        "https://www.googleapis.com/auth/gmail.modify", // Read/write access to Gmail (adjust if needed)
      ].join(" "),
      // Request offline access to get a refresh token
      accessType: "offline",
      // Prompt for consent every time to ensure refresh token is always sent (useful during development)
      // In production, you might remove this or set to 'auto' after the first consent
      prompt: "consent",
    },
    async ({
      accessToken,
      refreshToken,
      extraParams, // Contains token expiry (expires_in)
      profile, // User profile from Google
    }) => {
      // This function is called after successful authentication with Google.
      // profile contains: id, displayName, emails, photos, provider, _json, _raw
      console.log("[Auth Server] Google Strategy Callback triggered");
      console.log("[Auth Server] Profile ID:", profile.id); // Google's unique ID for the user
      console.log("[Auth Server] Profile Email:", profile.emails?.[0]?.value);
      console.log("[Auth Server] Access Token received:", !!accessToken);
      console.log("[Auth Server] Refresh Token received:", !!refreshToken); // Should be true with accessType: 'offline' and prompt: 'consent'

      const email = profile.emails?.[0]?.value;
      const displayName = profile.displayName || "Utilisateur Google";
      const googleId = profile.id; // Use Google's unique ID

      if (!email) {
        throw new Error("Email not found in Google profile.");
      }

      // Vérification du domaine de l'email
      if (!email.endsWith("@jdc.fr")) {
        throw new Error("Seuls les emails @jdc.fr sont autorisés.");
      }

      // Here, you might want to find or create a user in your own database (Firestore).
      // We'll use the Google ID as the primary link, but also store email/name.
      // IMPORTANT: Decide how to handle user IDs. Using Firebase Auth UID or Google ID?
      // For simplicity here, let's assume we use the Google ID as the primary key
      // in Firestore for users authenticated via Google OAuth for API access.
      // This might differ from users signed up via email/password using Firebase Auth.
      // You might need a strategy to link accounts if a user uses both methods.

      let userProfile: UserSession;

      try {
        // Attempt to find user by Google ID (or email, depending on your model)
        // NOTE: getUserProfileSdk likely expects Firebase UID. We need to adapt.
        // Let's assume for now we store Google users separately or adapt Firestore service.
        // For this example, we'll simulate finding/creating based on email for simplicity,
        // but using Google ID is more robust.

       // --- Firestore Interaction (Attempt, but don't fail auth if it errors) ---
       try {
         // Attempt to find user by Google ID (or adapt your logic)
         // IMPORTANT: getUserProfileSdk likely expects Firebase UID. This needs adaptation.
         console.log(`[Auth Server] Attempting to find Firestore profile for Google ID: ${googleId}`);
         await getUserProfileSdk(googleId); // This will likely fail if it expects Firebase UID
         console.log(`[Auth Server] Firestore profile found for Google ID: ${googleId}`);
       } catch (profileError: any) {
         // Check if the error means "not found" (adapt check as needed)
         if (profileError.message?.includes("not found") || profileError.code === 'not-found' || profileError.message?.includes("simulation")) {
           console.log(`[Auth Server] Firestore profile for Google ID ${googleId} not found. Attempting creation...`);
           try {
             // Attempt to create profile (this is where PERMISSION_DENIED happens currently)
             // IMPORTANT: createUserProfileSdk also likely expects Firebase UID as first arg. Needs adaptation.
             await createUserProfileSdk(
               googleId, // Using Google ID as the user ID here - NEEDS REVIEW/ADAPTATION
               email,
               displayName,
               'Technician' // Or determine role based on logic
               // Add googleId field if modifying existing structure
             );
             console.log(`[Auth Server] Firestore profile created successfully for Google ID: ${googleId}`);
           } catch (creationError: any) {
             // Log the creation error but DO NOT throw. Allow login to proceed.
             console.error(`[Auth Server] FAILED to create Firestore profile for Google ID ${googleId} (Email: ${email}). Error:`, creationError);
             // The PERMISSION_DENIED error will be logged here.
             // TODO: Fix Firestore server-side permissions separately.
           }
         } else {
           // Log other unexpected errors during profile lookup, but don't fail auth
           console.error(`[Auth Server] Unexpected error looking up Firestore profile for Google ID ${googleId}:`, profileError);
         }
       }
       // --- End Firestore Interaction ---

       // Regardless of Firestore success/failure, return the session data with Google info and tokens
       // This ensures the user is logged in via Remix Auth session.
       userProfile = {
          userId: googleId, // Using Google ID
          email: email,
          displayName: displayName,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          // Calculate expiry time (extraParams.expires_in is in seconds)
          tokenExpiry: Date.now() + extraParams.expires_in * 1000,
        };

      } catch (error) {
        console.error("[Auth Server] Error finding/creating user profile:", error);
        throw new Error("Failed to process user profile.");
      }

       // Return the user data to be stored in the session
       console.log("[Auth Server] Returning userProfile to authenticator:", userProfile); // Log before returning
       return userProfile;
     }
  )
);
