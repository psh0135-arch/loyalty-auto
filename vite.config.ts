import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { writeFileSync, mkdirSync } from "node:fs";
import { componentTagger } from "lovable-tagger";

const SITE_URL = process.env.SITE_URL || "https://loyalty-auto.lovable.app";

// Public, indexable routes only. Authenticated/admin routes are excluded.
const PUBLIC_ROUTES: Array<{ path: string; changefreq: string; priority: number }> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/auth", changefreq: "monthly", priority: 0.5 },
];

function buildSitemapXml(): string {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
).join("\n")}
</urlset>
`;
}

function sitemapPlugin(): Plugin {
  const xml = buildSitemapXml();
  return {
    name: "generate-sitemap",
    // Serve dynamically in dev so /sitemap.xml works without a build
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml");
          res.end(buildSitemapXml());
          return;
        }
        next();
      });
    },
    // Write file for production build
    buildStart() {
      try {
        mkdirSync("public", { recursive: true });
        writeFileSync("public/sitemap.xml", xml, "utf8");
      } catch (e) {
        console.warn("[sitemap] failed to write public/sitemap.xml", e);
      }
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
  plugins: [react(), sitemapPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
