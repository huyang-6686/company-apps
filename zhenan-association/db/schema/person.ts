import { pgTable, uuid, text, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const person = pgTable("person", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  unifiedEmployeeId: text("unified_employee_id"),
  feishuUserId: text("feishu_user_id").unique(),
  yuguangUserId: text("yuguang_user_id").unique(),
  displayName: text("display_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("person_tenant_idx").on(t.tenantId),
  uniqueIndex("person_tenant_unified_employee_idx").on(t.tenantId, t.unifiedEmployeeId),
]);
