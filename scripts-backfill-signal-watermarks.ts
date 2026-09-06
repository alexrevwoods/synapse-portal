import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { profiles, signalMedia, signals } from "./drizzle/schema";
import { getDb } from "./server/db";
import { watermarkSignalImage } from "./server/imageWatermark";
import { storageGetSignedUrl, storagePut } from "./server/storage";

const mimeForUrl = (url: string): "image/jpeg" | "image/png" | "image/webp" => {
  if (/\.png(?:$|\?)/i.test(url)) return "image/png";
  if (/\.webp(?:$|\?)/i.test(url)) return "image/webp";
  return "image/jpeg";
};

const extensionForMime = (mime: ReturnType<typeof mimeForUrl>) => ({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}[mime]);

const db = await getDb();
if (!db) throw new Error("Database is unavailable");

const rows = await db
  .select({ media: signalMedia, signal: signals, profile: profiles })
  .from(signalMedia)
  .innerJoin(signals, eq(signalMedia.signalId, signals.id))
  .innerJoin(profiles, eq(signals.profileId, profiles.id));

let updated = 0;
for (const row of rows) {
  const oldUrl = row.media.storageUrl;
  if (!oldUrl.startsWith("/manus-storage/")) {
    console.warn(`Skipping Signal media ${row.media.id}: not managed storage`);
    continue;
  }
  const mimeType = mimeForUrl(oldUrl);
  const signedUrl = await storageGetSignedUrl(oldUrl.slice("/manus-storage/".length));
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error(`Could not retrieve Signal media ${row.media.id} (${response.status})`);
  const original = Buffer.from(await response.arrayBuffer());
  const protectedImage = await watermarkSignalImage(original, mimeType, row.profile.displayName, row.profile.username);
  const filename = `signals/${row.profile.ownerUserId}/${row.profile.id}/protected-${crypto.randomUUID()}.${extensionForMime(mimeType)}`;
  const stored = await storagePut(filename, protectedImage, mimeType);

  await db.transaction(async (tx) => {
    await tx.update(signalMedia).set({ storageUrl: stored.url }).where(eq(signalMedia.id, row.media.id));
    await tx.update(signals).set({
      imageUrl: row.signal.imageUrl === oldUrl ? stored.url : row.signal.imageUrl,
      seoImageUrl: row.signal.seoImageUrl === oldUrl ? stored.url : row.signal.seoImageUrl,
    }).where(and(eq(signals.id, row.signal.id), eq(signals.profileId, row.profile.id)));
  });
  updated += 1;
  console.log(`Protected existing Signal media ${row.media.id}`);
}

console.log(`Completed full-image watermark backfill for ${updated} Signal asset(s).`);
