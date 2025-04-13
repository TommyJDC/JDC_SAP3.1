/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "netlify/**"], // Ignore the netlify functions directory
  serverBuildTarget: "netlify",
  serverBuildPath: "netlify/functions/server/index.js", // Explicitly define default server build path
};
