import { pgTable, uuid, text, timestamp, jsonb, index, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const notificationLog = pgTable("notification_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenant.id),
  channel: text("channel").notNull(),
  templateId: text("template_id"),
  recipientId: uuid("recipient_id"),
  payload: jsonb("payload"),
  status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("notification_log_tenant_status_idx").on(t.tenantId, t.status)]);

export const notificationEvent = pgTable("notification_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  sourceApplicationId: text("source_application_id").notNull(),
  recipientUnifiedEmployeeId: text("recipient_unified_employee_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  deepLink: jsonb("deep_link").notNull(),
  status: text("status").notNull().default("pending"),
  attemptCount: integer("attempt_count").notNull().default(0),
  failureReason: text("failure_reason"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("notification_event_tenant_source_event_idx").on(t.tenantId, t.sourceApplicationId, t.eventId),
  index("notification_event_recipient_status_idx").on(t.tenantId, t.recipientUnifiedEmployeeId, t.status),
]);
