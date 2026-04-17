/**
 * filename: frontend/vite.config.js
 * purpose: Vite configuration with backend API proxy.
 * setup notes: Proxy /api to Express server on port 5001 by default.
 */
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true
      }
    }
  }
});
