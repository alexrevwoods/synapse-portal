import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { escapeSvgText, watermarkSignalImage, watermarkSvg } from "./imageWatermark";

describe("Signal image watermark helpers", () => {
  it("escapes owner labels before embedding them in watermark SVG", () => {
    expect(escapeSvgText(`Sam & <Co> "works"`)).toBe("Sam &amp; &lt;Co&gt; &quot;works&quot;");
  });

  it("repeats the owner identity across the full image watermark grid", () => {
    const svg = watermarkSvg("© Media Revolution · @mediarevolution · WhoAreWe", 1280, 720).toString();
    const occurrences = svg.match(/© Media Revolution · @mediarevolution · WhoAreWe/g) ?? [];

    expect(occurrences.length).toBeGreaterThan(40);
    expect(svg).toContain('transform="rotate(-28 640 360)"');
  });

  it("bakes visible repeated ownership text into output PNG bytes", async () => {
    const source = await sharp({
      create: { width: 640, height: 360, channels: 3, background: { r: 255, g: 255, b: 255 } },
    }).png().toBuffer();
    const protectedImage = await watermarkSignalImage(source, "image/png", "Media Revolution", "mediarevolution");
    const { data, info } = await sharp(protectedImage).raw().toBuffer({ resolveWithObject: true });
    let darkSamples = 0;

    for (let y = 0; y < info.height; y += 4) {
      for (let x = 0; x < info.width; x += 4) {
        const pixel = (y * info.width + x) * info.channels;
        if (data[pixel] < 180 && data[pixel + 1] < 180 && data[pixel + 2] < 180) darkSamples += 1;
      }
    }

    expect(protectedImage.equals(source)).toBe(false);
    expect(info.width).toBe(640);
    expect(info.height).toBe(360);
    expect(darkSamples).toBeGreaterThan(450);
  });
});
