import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Allow specific dev tunnel hosts (e.g. localtunnel) that may proxy requests
    // to this dev server. Add any tunneled hostnames you expect to see here.
    allowedHosts: [
      'six-parts-remain.loca.lt',
      'localhost',
      '127.0.0.1'
    ],
    // During development Vite may use eval()/dev-only helpers for HMR and source-maps.
    // If your browser or environment enforces a strict CSP that blocks eval(), HMR
    // and some dev features will fail. For local development only we add a relaxed
    // Content-Security-Policy header to allow eval. Remove this before deploying.
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
