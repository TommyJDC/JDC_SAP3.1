// netlify/functions/google-buckets.js (CommonJS format)
const { Storage } = require("@google-cloud/storage");

// Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in Netlify environment variables
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
let credentials;
let storage;
let initializationError = null;

try {
  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set.");
  }
  credentials = JSON.parse(credentialsJson);
  storage = new Storage({ credentials });
} catch (error) {
  console.error("Failed to initialize Google Cloud Storage:", error);
  initializationError = error instanceof Error ? error.message : "Unknown initialization error";
  // We store the error but let the handler deal with returning a response
}

exports.handler = async (event, context) => {
  // Check if initialization failed
  if (initializationError || !storage) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server configuration error: ${initializationError || 'Storage not initialized.'}` }),
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
