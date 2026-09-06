import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { escapeSvgText, watermarkSignalImage } from "./imageWatermark";

describe("Signal image watermark helpers", () => {
  it("escapes owner labels before embedding them in watermark SVG", () => {
    expect(escapeSvgText(`Sam & <Co> "works"`)).toBe("Sam &amp; &lt;Co&gt; &quot;works&quot;");
  });

  it("bakes a visible ownership mark into output PNG bytes", async () => {
    const source = await sharp({
      create: { width: 640, height: 360, channels: 3, background: { r: 255, g: 255, b: 255 } },
    }).png().toBuffer();
    const protectedImage = await watermarkSignalImage(source, "image/png", "Media Revolution");
    const { data, info } = await sharp(protectedImage).raw().toBuffer({ resolveWithObject: true });
    const pixel = (310 * info.width + 310) * info.channels;

    expect(protectedImage.equals(source)).toBe(false);
    expect(info.width).toBe(640);
    expect(info.height).toBe(360);
    // This coordinate falls within the dark, bottom-right attribution pill.
    expect(data[pixel]).toBeLessThan(80);
    expect(data[pixel + 1]).toBeLessThan(80);
    expect(data[pixel + 2]).toBeLessThan(80);
  });
});
