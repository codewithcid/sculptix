/**
 * Generate every app + store image from a single source logo.
 *
 * 1. Save the Sculptix logo (square PNG, ideally 1024×1024+) to:
 *      assets/source-logo.png
 * 2. Run:  npm run generate:assets
 *
 * Produces (in assets/):
 *   icon.png             1024×1024  app icon (full bleed on brand background)
 *   adaptive-icon.png    1024×1024  Android adaptive foreground (safe-zone padded)
 *   splash.png           1284×1284  splash logo (centered, contained at runtime)
 *   favicon.png            48×48    web favicon
 *   playstore-icon.png    512×512   Play Console hi-res icon
 *   feature-graphic.png  1024×500   Play Console feature graphic
 *
 * Upload playstore-icon.png and feature-graphic.png in the Play Console; the
 * other four are bundled by Expo via app.json.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '../assets');
const SOURCE = resolve(ASSETS, 'source-logo.png');
const BG = { r: 11, g: 11, b: 15, alpha: 1 }; // #0B0B0F — matches app.json splash/icon bg

if (!existsSync(SOURCE)) {
  console.error(
    `\n✖ Missing source logo.\n  Save the Sculptix logo to:\n    ${SOURCE}\n  (square PNG, 1024×1024 or larger), then re-run: npm run generate:assets\n`,
  );
  process.exit(1);
}

/** Resize the logo to `inner` px and center it on a `size` px brand-colored canvas. */
async function framed(size, inner, out, { transparent = false } = {}) {
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const pad = Math.round((size - inner) / 2);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : BG,
    },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(resolve(ASSETS, out));
  console.log(`✓ ${out}`);
}

async function featureGraphic() {
  const w = 1024;
  const h = 500;
  const inner = 360;
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: w, height: h, channels: 4, background: BG } })
    .composite([{ input: logo, top: Math.round((h - inner) / 2), left: Math.round((w - inner) / 2) }])
    .png()
    .toFile(resolve(ASSETS, 'feature-graphic.png'));
  console.log('✓ feature-graphic.png');
}

async function main() {
  // App icon: logo nearly full-bleed on the brand background.
  await framed(1024, 940, 'icon.png');
  // Adaptive icon: extra padding so the system mask never clips the figure.
  await framed(1024, 660, 'adaptive-icon.png');
  // Splash: logo centered with generous breathing room.
  await framed(1284, 720, 'splash.png');
  // Web favicon.
  await framed(48, 44, 'favicon.png');
  // Play Console hi-res icon (512×512).
  await framed(512, 470, 'playstore-icon.png');
  // Play Console feature graphic (1024×500).
  await featureGraphic();
  console.log('\nAll assets generated in assets/.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
