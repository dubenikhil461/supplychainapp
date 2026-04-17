/**
 * filename: frontend/vite.config.js
 * purpose: Vite configuration with backend API proxy.
 * setup notes: Proxy /api to Express; target port must match backend (e.g. PORT in backend/.env).
 */
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5008",
        changeOrigin: true
      }
    }
  }
});
