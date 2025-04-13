/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Ignore the netlify functions directory
  serverBuildTarget: "netlify",
  // server: "./server.js", // Remove this line - Netlify adapter provides its own entry point
};
