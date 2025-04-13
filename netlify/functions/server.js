// netlify/functions/server.js
// Uses the Netlify adapter v1 with corrected build path import
import { createRequestHandler } from "@remix-run/netlify";

// Use relative path to the actual server build output (default path)
import * as build from "../../build/index.js";

export const handler = createRequestHandler({
  build,
  // getLoadContext can be used to pass data/functions to loaders/actions
  getLoadContext: () => ({}),
});
