import { Queue } from "bullmq";
import Redis from "ioredis";

let offrampQueue: Queue | null = null;

export function getOfframpQueue(): Queue {
  if (offrampQueue) {
    return offrampQueue;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }
  const connection = new Redis(url, { maxRetriesPerRequest: null });
  offrampQueue = new Queue("offramp", { connection });
  return offrampQueue;
}
