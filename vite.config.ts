import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Import the plugin

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    nodePolyfills({
      // Options (optional): specify whether to polyfill specific globals
      globals: {
        Buffer: true, // Default: true. Example: provide a Buffer polyfill
        global: true, // Default: true
        process: true, // Default: true
      },
      // Specify whether to polyfill specific protocol imports
      protocolImports: true, // Default: true. Polyfills imports like "node:fs"
    }),
  ],
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
