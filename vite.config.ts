import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      // Explicitly tell Remix where the app directory is
      appDirectory: "app",
     }),
     tsconfigPaths(),
   ],
   optimizeDeps: {
     // Remove 'leaflet' as it's no longer used
     // Explicitly include react-map-gl and mapbox-gl to potentially help with resolution
     include: ['react-map-gl', 'mapbox-gl'],
   },
   ssr: {
    // Remove 'uuid' as it's no longer an external dependency
    noExternal: ['isbot'], // Keep isbot here if it was needed before
  },
});
