/**
 * BullMQ worker for off-ramp jobs. Run: `npm run worker:offramp` from `apps/web`.
 */
import { Worker } from "bullmq";
import Redis from "ioredis";
import { prisma } from "../lib/prisma";

const url = process.env.REDIS_URL;
if (!url) {
  console.error("REDIS_URL is required");
  process.exit(1);
}

const connection = new Redis(url, { maxRetriesPerRequest: null });

const worker = new Worker(
  "offramp",
  async (job) => {
    const { offrampId } = job.data as { offrampId: string };
    await prisma.offrampRequest.updateMany({
      where: { id: offrampId, status: "initiated" },
      data: { status: "processing", providerRef: "stub-worker" },
    });
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error("[offramp worker] job failed", job?.id, err);
});

worker.on("completed", (job) => {
  console.log("[offramp worker] completed", job.id);
});

console.log("Offramp worker listening on queue offramp");
