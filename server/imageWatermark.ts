import sharp from "sharp";

const MAX_SIDE = 2560;

function escapeSvgText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function watermarkSvg(label: string, width: number, height: number) {
  const safeLabel = escapeSvgText(label.slice(0, 96));
  const fontSize = Math.max(13, Math.min(34, Math.round(width * 0.026)));
  const paddingX = Math.round(fontSize * 1.15);
  const paddingY = Math.round(fontSize * 0.75);
  const barHeight = fontSize + paddingY * 2;
  const labelWidth = Math.min(width - 24, Math.max(180, Math.round(safeLabel.length * fontSize * 0.62 + paddingX * 2)));
  const x = Math.max(12, width - labelWidth - 18);
  const y = Math.max(12, height - barHeight - 18);

  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/></filter></defs><g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${labelWidth}" height="${barHeight}" rx="${Math.round(barHeight / 2)}" fill="#07101f" fill-opacity="0.75" stroke="#ffffff" stroke-opacity="0.25"/><text x="${x + paddingX}" y="${y + Math.round(barHeight / 2 + fontSize * 0.36)}" fill="#ffffff" fill-opacity="0.96" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="0.4">${safeLabel}</text></g></svg>`);
}

/**
 * Store a visible attribution mark in the image bytes themselves so standard
 * save and new-tab actions retain the Portal owner's copyright notice.
 */
export async function watermarkSignalImage(
  input: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  ownerName: string,
) {
  const source = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 }).rotate();
  const metadata = await source.metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 675;
  const scale = Math.min(1, MAX_SIDE / width, MAX_SIDE / height);
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));
  const label = `© ${ownerName} · WhoAreWe`;
  const pipeline = source
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .composite([{ input: watermarkSvg(label, outputWidth, outputHeight), top: 0, left: 0 }]);

  if (mimeType === "image/png") return pipeline.png({ compressionLevel: 9 }).toBuffer();
  if (mimeType === "image/webp") return pipeline.webp({ quality: 90 }).toBuffer();
  return pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

export { escapeSvgText };
