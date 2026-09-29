import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Where this page is served from. Social scrapers can't resolve relative URLs
 * and don't run JS, so og:url / og:image / canonical have to be absolute and
 * baked in at build time.
 *
 * Defaults to the live campaign URL. Override with VITE_SITE_URL only if the
 * page moves, and check that og-image.jpg still resolves under the new path.
 */
const SITE_URL = (
  process.env.VITE_SITE_URL || "https://madmonkeyhostels.com/campaigns/all-in"
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
