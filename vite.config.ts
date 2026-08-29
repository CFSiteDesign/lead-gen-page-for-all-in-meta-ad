import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Where this page is served from. Social scrapers can't resolve relative URLs
 * and don't run JS, so og:url / og:image / canonical have to be absolute and
 * baked in at build time.
 *
 * Set VITE_SITE_URL to the real domain once it's known. The fallback is the
 * Lovable preview URL so a build never ships a broken placeholder.
 */
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  "https://id-preview--dd20555c-e6eb-4512-a003-bdd808d48925.lovable.app"
).replace(/\/+$/, "");

function siteUrlPlugin(): Plugin {
  return {
    name: "inject-site-url",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => html.split("%SITE_URL%").join(SITE_URL),
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), siteUrlPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
