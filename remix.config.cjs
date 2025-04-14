/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: 'all',
  ignoredRouteFiles: ['**/.*'],
  serverBuildTarget: "netlify",
  server: "./server.js",
  // serverBuildTarget: 'netlify', // Not needed when using @netlify/remix-adapter Vite plugin
};
