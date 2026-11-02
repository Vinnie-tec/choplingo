
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { assistantRateLimits } from "@/lib/db/schema/assistant-rate-limit";

const REQUEST_LIMIT = 2;
const WINDOW_SECONDS = 60;

export async function checkAssistantRateLimit(userId: string) {
  const result = await db
    .insert(assistantRateLimits)
    .values({
      userId,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: assistantRateLimits.userId,
      set: {
        requestCount: sql`
          CASE
            WHEN ${assistantRateLimits.windowStartedAt}
              <= NOW() - INTERVAL '60 seconds'
            THEN 1
            ELSE ${assistantRateLimits.requestCount} + 1
          END
        `,
        windowStartedAt: sql`
          CASE
            WHEN ${assistantRateLimits.windowStartedAt}
              <= NOW() - INTERVAL '60 seconds'
            THEN NOW()
            ELSE ${assistantRateLimits.windowStartedAt}
          END
        `,
      },
    })
    .returning({
      requestCount: assistantRateLimits.requestCount,
      windowStartedAt: assistantRateLimits.windowStartedAt,
    });

  const usage = result[0];

  return {
    allowed: usage.requestCount <= REQUEST_LIMIT,
    remaining: Math.max(0, REQUEST_LIMIT - usage.requestCount),
    resetAt: new Date(
      usage.windowStartedAt.getTime() + WINDOW_SECONDS * 1000
    ),
  };
}
