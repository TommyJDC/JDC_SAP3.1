/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Ignore the netlify functions directory
  serverBuildTarget: "netlify",
  server: "./netlify/functions/server.js", // Add server entry point as per new instructions
};
