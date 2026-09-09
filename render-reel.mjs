import puppeteer from 'puppeteer-core';
import { mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const CHROME     = '/tmp/chromium/chrome-linux/headless_shell';
const HTML       = 'file:///sessions/cool-zealous-gauss/mnt/nonprofit/firehacks-reel-source.html';
const FRAMES_DIR = '/tmp/reel-frames';
const OUT_MP4    = '/sessions/cool-zealous-gauss/mnt/nonprofit/firehacks-reel.mp4';
const FPS        = 30;
const TOTAL      = 450; // 15 seconds

try { rmSync(FRAMES_DIR, { recursive: true }); } catch {}
mkdirSync(FRAMES_DIR, { recursive: true });

console.log('🚀 Launching browser...');
const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--font-render-hinting=none'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

console.log(`🎬 Rendering ${TOTAL} frames at ${FPS}fps...`);
for (let f = 0; f < TOTAL; f++) {
  await page.goto(`${HTML}?f=${f}`, { waitUntil: 'networkidle0', timeout: 10000 });
  const padded = String(f).padStart(4, '0');
  await page.screenshot({
    path: `${FRAMES_DIR}/frame-${padded}.png`,
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1920 },
  });
  if (f % 30 === 0) process.stdout.write(`\r   ${f}/${TOTAL} (${Math.round(f/TOTAL*100)}%)`);
}

await browser.close();
console.log(`\n✅ Frames captured`);

console.log('🎞  Stitching with ffmpeg...');
execSync(
  `ffmpeg -y -framerate ${FPS} -i ${FRAMES_DIR}/frame-%04d.png ` +
  `-c:v libx264 -pix_fmt yuv420p -preset fast -crf 18 ` +
  `${OUT_MP4}`,
  { stdio: 'inherit' }
);

console.log(`\n🔥 Done → firehacks-reel.mp4`);
