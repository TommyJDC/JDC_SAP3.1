/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Ignore the netlify functions directory
  serverBuildTarget: "netlify", // Keep only this for Netlify v2 adapter behavior
  // serverBuildPath: "netlify/functions/server/index.js", // Ensure this is removed
  // server: "./netlify/functions/server.js", // Ensure this is removed
};
