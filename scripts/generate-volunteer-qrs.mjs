/**
 * Generate QR codes for volunteer category signup pages.
 * Usage: node scripts/generate-volunteer-qrs.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";

const ORIGIN = "https://codestarters.org";
const OUT_DIR = join(process.cwd(), "public/qr");

const CATEGORIES = [
  { slug: "leadership", title: "Leadership" },
  { slug: "marketing", title: "Marketing" },
  { slug: "teaching", title: "Teaching" },
  { slug: "outreach", title: "Outreach (Fundraising Partnerships and Outreach)" },
];

const CLUB_FAIR_URL = `${ORIGIN}/join`;
await QRCode.toFile(join(OUT_DIR, "club-fair.png"), CLUB_FAIR_URL, {
  type: "png",
  width: 720,
  margin: 2,
  color: { dark: "#0A0A0A", light: "#FFFFFF" },
});
await writeFile(
  join(OUT_DIR, "club-fair.svg"),
  await QRCode.toString(CLUB_FAIR_URL, { type: "svg", margin: 2 }),
);
console.log(`Club fair expedited: ${CLUB_FAIR_URL}`);
console.log("  PNG: /qr/club-fair.png");
console.log("  SVG: /qr/club-fair.svg");

await mkdir(OUT_DIR, { recursive: true });

for (const category of CATEGORIES) {
  const url = `${ORIGIN}/?volunteer=${category.slug}`;
  const pngPath = join(OUT_DIR, `volunteer-${category.slug}.png`);
  const svgPath = join(OUT_DIR, `volunteer-${category.slug}.svg`);

  await QRCode.toFile(pngPath, url, {
    type: "png",
    width: 720,
    margin: 2,
    color: { dark: "#0A0A0A", light: "#FFFFFF" },
  });
  const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
  await writeFile(svgPath, svg);

  console.log(`${category.title}: ${url}`);
  console.log(`  PNG: /qr/volunteer-${category.slug}.png`);
  console.log(`  SVG: /qr/volunteer-${category.slug}.svg`);
}
