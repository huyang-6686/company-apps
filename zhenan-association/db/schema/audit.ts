import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";
import { person } from "./person";

export const auditEvent = pgTable("audit_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenant.id),
  actorId: uuid("actor_id").references(() => person.id),
  traceId: text("trace_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  summary: jsonb("summary"),
  detail: jsonb("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("audit_event_tenant_created_idx").on(t.tenantId, t.createdAt)]);
