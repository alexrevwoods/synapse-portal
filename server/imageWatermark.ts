import sharp from "sharp";

const MAX_SIDE = 2560;
export const watermarkStrengths = ["standard", "strong", "maximum"] as const;
export type WatermarkStrength = (typeof watermarkStrengths)[number];

function escapeSvgText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function watermarkSvg(label: string, width: number, height: number, strength: WatermarkStrength = "strong") {
  const safeLabel = escapeSvgText(label.slice(0, 96));
  const shortSide = Math.min(width, height);
  const protection = {
    standard: { fontScale: 0.78, opacity: 0.28, lineScale: 1.36, wordScale: 1.26 },
    strong: { fontScale: 1, opacity: 0.42, lineScale: 1, wordScale: 1 },
    maximum: { fontScale: 1.12, opacity: 0.56, lineScale: 0.8, wordScale: 0.82 },
  }[strength];
  const fontSize = Math.max(15, Math.min(48, Math.round(shortSide * 0.047 * protection.fontScale)));
  const lineGap = Math.max(76, Math.round(fontSize * 4.4 * protection.lineScale));
  const wordGap = Math.max(220, Math.round(fontSize * Math.min(28, safeLabel.length * 0.68 + 5) * protection.wordScale));
  const extent = Math.ceil(Math.hypot(width, height));
  const textNodes: string[] = [];

  // The rotated grid deliberately extends beyond every edge. A single corner
  // badge is easy to crop; repeated text keeps the owner attribution present
  // in ordinary mobile saves, desktop downloads, and screenshots of any area.
  for (let y = -extent; y <= height + extent; y += lineGap) {
    for (let x = -extent; x <= width + extent; x += wordGap) {
      textNodes.push(`<text x="${x}" y="${y}" fill="#ffffff" fill-opacity="${protection.opacity}" stroke="#050912" stroke-opacity="0.48" stroke-width="2.4" paint-order="stroke" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="0.7">${safeLabel}</text>`);
    }
  }

  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-28 ${Math.round(width / 2)} ${Math.round(height / 2)})">${textNodes.join("")}</g></svg>`);
}

/**
 * Store a visible attribution mark in the image bytes themselves so standard
 * save and new-tab actions retain the Portal owner's copyright notice.
 */
export async function watermarkSignalImage(
  input: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  ownerName: string,
  ownerUsername?: string,
  strength: WatermarkStrength = "strong",
) {
  // Rotate and resize first, then read the normalized dimensions. EXIF rotation
  // can swap width and height, and the SVG composite must exactly match the
  // final raster bounds on every phone-originated image.
  const normalized = await sharp(input, { failOn: "error", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .toBuffer();
  const metadata = await sharp(normalized).metadata();
  const outputWidth = metadata.width || 1200;
  const outputHeight = metadata.height || 675;
  const label = `© ${ownerName}${ownerUsername ? ` · @${ownerUsername}` : ""} · WhoAreWe`;
  const pipeline = sharp(normalized).composite([{ input: watermarkSvg(label, outputWidth, outputHeight, strength), top: 0, left: 0 }]);

  if (mimeType === "image/png") return pipeline.png({ compressionLevel: 9 }).toBuffer();
  if (mimeType === "image/webp") return pipeline.webp({ quality: 90 }).toBuffer();
  return pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

export { escapeSvgText, watermarkSvg };
