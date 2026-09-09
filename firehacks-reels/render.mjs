import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compositions = [
  { id: "HypeTrailer", out: "../firehacks-reel1.mp4" },
  { id: "WhyJoin",    out: "../firehacks-reel2.mp4" },
];

console.log("📦 Bundling...");
const bundleLocation = await bundle({
  entryPoint: path.join(__dirname, "src/index.jsx"),
  webpackOverride: (cfg) => cfg,
});
console.log("✅ Bundle ready");

for (const { id, out } of compositions) {
  console.log(`\n🎬 Rendering ${id}...`);
  const comp = await selectComposition({ serveUrl: bundleLocation, id });
  await renderMedia({
    composition: comp,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: path.join(__dirname, out),
    onProgress: ({ progress }) => {
      process.stdout.write(`\r   ${(progress * 100).toFixed(1)}%`);
    },
  });
  console.log(`\n✅ Saved → ${out}`);
}

console.log("\n🔥 Both reels rendered!");
