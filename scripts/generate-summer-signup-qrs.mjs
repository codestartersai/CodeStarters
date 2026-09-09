/**
 * Generate QR codes for summer bootcamp signup pages.
 * Usage: node scripts/generate-summer-signup-qrs.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";

const ORIGIN = "https://codestarters.org";
const OUT_DIR = join(process.cwd(), "public/qr");

const BOOTCAMPS = [
  { slug: "ai", title: "AI Development & Agent Engineering" },
  { slug: "advanced-cs", title: "Advanced CS" },
  { slug: "basic-cs", title: "Basic CS Foundations" },
  { slug: "python", title: "Python" },
];

await mkdir(OUT_DIR, { recursive: true });

const allUrl = `${ORIGIN}/summer-signup`;
await QRCode.toFile(join(OUT_DIR, "summer-signup-all.png"), allUrl, {
  type: "png",
  width: 720,
  margin: 2,
  color: { dark: "#0A0A0A", light: "#FFFFFF" },
});
await writeFile(
  join(OUT_DIR, "summer-signup-all.svg"),
  await QRCode.toString(allUrl, { type: "svg", margin: 2 }),
);
console.log(`All bootcamps: ${allUrl}`);
console.log("  PNG: /qr/summer-signup-all.png");

for (const bootcamp of BOOTCAMPS) {
  const url = `${ORIGIN}/summer-signup/${bootcamp.slug}`;
  const pngPath = join(OUT_DIR, `summer-signup-${bootcamp.slug}.png`);
  const svgPath = join(OUT_DIR, `summer-signup-${bootcamp.slug}.svg`);

  await QRCode.toFile(pngPath, url, {
    type: "png",
    width: 720,
    margin: 2,
    color: { dark: "#0A0A0A", light: "#FFFFFF" },
  });
  const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
  await writeFile(svgPath, svg);

  console.log(`${bootcamp.title}: ${url}`);
  console.log(`  PNG: /qr/summer-signup-${bootcamp.slug}.png`);
}
