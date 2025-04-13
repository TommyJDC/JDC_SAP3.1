import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [remix(), tsconfigPaths()], // Corrected duplicate plugins
  server: {
    watch: {
      ignored: ['**/netlify/**'], // Ignore netlify directory for dev server watcher
    }
  },
  esbuild: {
    platform: 'node', // Set esbuild platform to node
  },
  build: {
    target: 'es2020',
  },
  ssr: {
    target: 'node',
    // Explicitly mark problematic packages as external for SSR build
    external: ['@google-cloud/storage', 'google-gax'], 
    // Remove noExternal to allow Vite to handle node_modules correctly
  }
});
