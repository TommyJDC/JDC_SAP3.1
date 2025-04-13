/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*", "netlify/**"],
  serverBuildTarget: "netlify",
  serverBuildPath: "netlify/functions/server.js",
};