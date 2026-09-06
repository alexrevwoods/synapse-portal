import sharp from "sharp";
import { watermarkSignalImage } from "./server/imageWatermark";

const width = 1280;
const height = 720;
const input = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0b1d38"/><stop offset="0.5" stop-color="#145f8f"/><stop offset="1" stop-color="#5b2a86"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><circle cx="280" cy="260" r="170" fill="#00d8ff" fill-opacity=".18"/><circle cx="920" cy="410" r="230" fill="#9b4dff" fill-opacity=".25"/><text x="80" y="130" fill="white" font-family="Arial" font-size="62" font-weight="700">Signal image sample</text><text x="84" y="195" fill="#cfe8ff" font-family="Arial" font-size="28">A permanent, visible ownership attribution.</text></svg>`);
const original = await sharp(input).png().toBuffer();
const protectedImage = await watermarkSignalImage(original, "image/png", "Media Revolution", "mediarevolution");
await sharp(protectedImage).png().toFile(".manus-logs/watermarked-signal-sample.png");
