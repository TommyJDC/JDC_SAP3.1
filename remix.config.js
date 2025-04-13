/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Ignore the netlify functions directory
  serverBuildTarget: "netlify",
  // serverBuildPath: "netlify/functions/server/index.js", // Remove incorrect build path
  server: "./netlify/functions/server.js", // Point to the manual v1 handler
};
