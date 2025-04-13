/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Keep ignoring netlify directory
  serverBuildTarget: "netlify", // Use standard v2 target
  // server: "./netlify/functions/server.js", // Remove manual server entry
  // serverBuildPath: "netlify/functions/server/build.js", // Remove manual build path
};
