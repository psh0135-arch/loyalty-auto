import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// Public, indexable routes only. Authenticated/admin routes are excluded.
const SITE_URL = process.env.SITE_URL || "https://loyalty-auto.lovable.app";

const routes: Array<{ path: string; changefreq: string; priority: number }> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/auth", changefreq: "monthly", priority: 0.5 },
];

const today = new Date().toISOString().split("T")[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const outPath = resolve(process.cwd(), "public/sitemap.xml");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, xml, "utf8");
console.log(`✓ sitemap.xml generated with ${routes.length} URLs at ${outPath}`);
