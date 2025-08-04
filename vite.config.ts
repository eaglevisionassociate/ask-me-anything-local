import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
//import { componentTagger } from "lovable-tagger";
import { componentTagger } from "react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    //mode === 'development' &&
    //componentTagger(),
    mode === 'development' &&
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
