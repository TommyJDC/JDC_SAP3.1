import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// Removed import for nodePolyfills

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  // Removed server.watch.ignored
  // Removed esbuild.platform
  build: {
    target: 'es2020', // Keep build target
  },
  // Removed ssr config block
});
