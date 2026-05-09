import { ApiError } from "@/lib/http";
import { getRedis } from "@/lib/redis";

const STATUS_LIMIT = 60;
const STATUS_WINDOW_SEC = 60;

/**
 * Fixed-window counter (per minute bucket). Good enough for MVP status polling cap.
 */
export async function assertStatusRateLimit(blinkId: string): Promise<void> {
  const bucket = Math.floor(Date.now() / (STATUS_WINDOW_SEC * 1000));
  const key = `rl:blink_status:${blinkId}:${bucket}`;
  const redis = getRedis();
  const n = await redis.incr(key);
  if (n === 1) {
    await redis.expire(key, STATUS_WINDOW_SEC * 2);
  }
  if (n > STATUS_LIMIT) {
    throw new ApiError(
      429,
      "RATE_LIMIT",
      "Too many status requests for this Blink"
    );
  }
}
