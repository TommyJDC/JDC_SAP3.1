// netlify/functions/google-buckets.js
import { Storage } from "@google-cloud/storage";

// Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in Netlify environment variables
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
  : undefined;

if (!credentials) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set or invalid.");
  // Return an error response immediately if credentials are missing
  // Note: This check runs at function initialization, not per request.
  // A better approach might be to check inside the handler if initialization fails.
}

const storage = new Storage({ credentials });

export const handler = async (event, context) => {
  // Check credentials again inside the handler in case initialization failed silently
  // or if the variable is somehow unset between init and invocation.
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
     return {
       statusCode: 500,
       body: JSON.stringify({ error: "Server configuration error: Google credentials missing." }),
       headers: { 'Content-Type': 'application/json' },
     };
  }

  try {
    const [buckets] = await storage.getBuckets();
    const bucketNames = buckets.map(bucket => bucket.name);

    return {
      statusCode: 200,
      body: JSON.stringify({ buckets: bucketNames }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error("Error fetching buckets:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch buckets: ${errorMessage}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
