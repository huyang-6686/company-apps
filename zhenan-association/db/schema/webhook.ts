import { pgTable, uuid, text, timestamp, jsonb, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const webhookEvent = pgTable("webhook_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenant.id),
  provider: text("provider").notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("queued"),
  retryCount: integer("retry_count").notNull().default(0),
  failureReason: text("failure_reason"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("webhook_event_provider_event_idx").on(t.provider, t.eventId),
  index("webhook_event_status_idx").on(t.status),
]);
