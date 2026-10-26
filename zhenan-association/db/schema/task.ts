import { pgTable, uuid, text, timestamp, jsonb, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const taskItem = pgTable("task_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  taskId: text("task_id").notNull(),
  taskType: text("task_type").notNull(),
  sourceApplicationId: text("source_application_id").notNull(),
  publisherUnifiedEmployeeId: text("publisher_unified_employee_id").notNull(),
  recipientUnifiedEmployeeIds: jsonb("recipient_unified_employee_ids").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  acceptanceStatus: text("acceptance_status").notNull().default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("task_item_tenant_source_task_idx").on(t.tenantId, t.sourceApplicationId, t.taskId),
  index("task_item_tenant_status_idx").on(t.tenantId, t.status),
]);
