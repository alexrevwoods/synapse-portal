import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { signalMedia, signals } from "./drizzle/schema";
import { getDb } from "./server/db";
import { prepareSignalDisplayImage, watermarkSignalImage } from "./server/imageWatermark";
import { storageGetSignedUrl, storagePut } from "./server/storage";

const originals = [
  { mediaId: 1, originalUrl: "/manus-storage/signals/1/1/f9317c17-4ff4-4052-b565-27fae5781722_b38fbd2b.jpg", ownerName: "Media Revolution", username: "mediarevolution", userId: 1, profileId: 1 },
  { mediaId: 2, originalUrl: "/manus-storage/signals/1/30002/f273a612-ad0d-441b-84f6-f05c04b7a89c_bb0cc710.jpg", ownerName: "Alex Revwoods", username: "alexrevwoods", userId: 1, profileId: 30002 },
  { mediaId: 3, originalUrl: "/manus-storage/signals/60078/30001/ded61f56-307a-4dde-9b8d-e11bd64cf940_bdfc5666.jpg", ownerName: "Hyacinth CS", username: "hcs02", userId: 60078, profileId: 30001 },
] as const;

const db = await getDb();
if (!db) throw new Error("Database is unavailable");

for (const item of originals) {
  const existing = await db.select().from(signalMedia).where(eq(signalMedia.id, item.mediaId)).limit(1);
  if (!existing[0]) throw new Error(`Signal media ${item.mediaId} does not exist`);
  const signedUrl = await storageGetSignedUrl(item.originalUrl.slice("/manus-storage/".length));
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error(`Original Signal media ${item.mediaId} could not be retrieved (${response.status})`);
  const original = Buffer.from(await response.arrayBuffer());
  const [clean, protectedImage] = await Promise.all([
    prepareSignalDisplayImage(original, "image/jpeg"),
    watermarkSignalImage(original, "image/jpeg", item.ownerName, item.username, "strong"),
  ]);
  const uploadId = crypto.randomUUID();
  const [cleanStored, protectedStored] = await Promise.all([
    storagePut(`signals/${item.userId}/${item.profileId}/clean-${uploadId}.jpg`, clean, "image/jpeg"),
    storagePut(`signals/${item.userId}/${item.profileId}/protected-${uploadId}.jpg`, protectedImage, "image/jpeg"),
  ]);
  const oldCurrentUrl = existing[0].storageUrl;
  await db.transaction(async (tx) => {
    await tx.update(signalMedia).set({ storageUrl: cleanStored.url, protectedStorageUrl: protectedStored.url }).where(eq(signalMedia.id, item.mediaId));
    await tx.update(signals).set({ imageUrl: cleanStored.url }).where(and(eq(signals.id, existing[0].signalId), eq(signals.imageUrl, oldCurrentUrl)));
  });
  console.log(`Backfilled clean viewer and protected download versions for Signal media ${item.mediaId}`);
}

console.log("Completed clean-view backfill for existing Signal images.");
