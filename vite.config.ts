import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin"; // Import Netlify adapter plugin
// Removed import for nodePolyfills

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    netlifyPlugin() // Add Netlify adapter plugin
  ],
  // Removed server.watch.ignored
  // Removed esbuild.platform
  build: {
    target: 'es2020', // Keep build target
  },
  // Removed ssr config block as external/noExternal are no longer needed
});
