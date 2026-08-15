import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { loadEnv } from "vite";

/**
 * Emits robots.txt + sitemap.xml into the build output.
 *
 * Only real, implemented public routes are listed (home + the hotels listing —
 * the sole crawler-relevant public surfaces). Hidden auth/account/admin/booking
 * and param routes are intentionally excluded. The hostname comes from
 * VITE_SITE_URL (or VITE_FRONTEND_URL) so no domain is ever invented; sitemap
 * is omitted when no URL is configured rather than emitting a wrong one.
 */
function seoFilesPlugin() {
  let resolvedRoot = process.cwd();
  let resolvedOutDir = "dist";
  let siteUrl = "";

  return {
    name: "vite-plugin-seo-files",
    apply: "build",
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, "");
      siteUrl = (env.VITE_SITE_URL || env.VITE_FRONTEND_URL || "").replace(/\/+$/, "");
      resolvedOutDir = config.build.outDir;
      resolvedRoot = config.root;
    },
    closeBundle() {
      const outDir = path.isAbsolute(resolvedOutDir)
        ? resolvedOutDir
        : path.resolve(resolvedRoot, resolvedOutDir);

      if (siteUrl) {
        const sitemap =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url><loc>${siteUrl}/</loc></url>\n` +
          `  <url><loc>${siteUrl}/hotels</loc></url>\n` +
          `</urlset>\n`;
        writeFileSync(path.resolve(outDir, "sitemap.xml"), sitemap);
      }

      const robots = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /auth/",
        "Disallow: /account/",
        "Disallow: /admin/",
        "Disallow: /booking",
        "Disallow: /booking/",
        siteUrl && `Sitemap: ${siteUrl}/sitemap.xml`,
      ]
        .filter(Boolean)
        .join("\n") + "\n";
      writeFileSync(path.resolve(outDir, "robots.txt"), robots);
    },
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoFilesPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    open: false,
    // Proxy API calls to the Express backend during development
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /**
         * Split node_modules into stable vendor chunks so a bump to one library
         * (e.g. react-query) only re-downloads its own chunk, not the whole app.
         * Groups mirror the app's core dependencies; tiny/single-purpose packages
         * share "vendor-misc" to avoid over-splitting.
         *
         * Order matters: more specific matches (@tanstack, react-router) run first
         * because broad patterns like "/react/" also match inside other paths.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) {
            return "vendor-react";
          }
          if (
            id.includes("@reduxjs") ||
            id.includes("react-redux") ||
            id.includes("/redux") ||
            id.includes("immer") ||
            id.includes("reselect") ||
            id.includes("use-sync-external-store")
          ) {
            return "vendor-redux";
          }
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
            return "vendor-framer";
          }
          if (id.includes("swiper")) return "vendor-swiper";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("lenis")) return "vendor-lenis";

          // Recharts (and its d3 internals) is only used by the lazy
          // AdminDashboard route — isolate it so its ~145kB gz never rides
          // along on the first paint, and is fetched only when the dashboard
          // actually opens.
          if (id.includes("recharts") || id.includes("victory-vendor")) return "vendor-charts";
          if (
            /[\\/]node_modules[\\/]d3([\\/]|-[^\\/]*[\\/]|$)/.test(id) ||
            id.includes("d3-array") ||
            id.includes("d3-color") ||
            id.includes("d3-format") ||
            id.includes("d3-interpolate") ||
            id.includes("d3-path") ||
            id.includes("d3-scale") ||
            id.includes("d3-shape") ||
            id.includes("d3-time") ||
            id.includes("d3-time-format")
          ) {
            return "vendor-charts";
          }

          // react-hook-form (+ its controller bridge) is used only by the lazy
          // booking/checkout and admin forms — keep it out of the eager graph.
          if (id.includes("react-hook-form") || id.includes("@hookform/resolvers")) {
            return "vendor-forms";
          }

          return "vendor-misc";
        },
      },
    },
  },
});
