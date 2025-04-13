/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Keep ignoring netlify directory
  // serverBuildTarget: "netlify", // Remove this target
  server: "./netlify/functions/server.js", // Define the manual server entry point
  serverBuildPath: "netlify/functions/server/build.js", // Define the server build output path relative to the function
};
