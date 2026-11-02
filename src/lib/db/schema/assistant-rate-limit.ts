
import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const assistantRateLimits = pgTable(
  "assistant_rate_limits",
  {
    // The authenticated user making assistant requests.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // When the current one-minute rate-limit window began.
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // Number of requests made within the current window.
    requestCount: integer("request_count")
      .notNull()
      .default(0),
  },
  (table) => [
    primaryKey({
      columns: [table.userId],
    }),
  ]
);
