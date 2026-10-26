import { pgTable, uuid, text, timestamp, boolean, numeric, index } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const memberUnit = pgTable("member_unit", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  name: text("name").notNull(),
  creditCode: text("credit_code").notNull().unique(),
  category: text("category").notNull(),
  tier: text("tier"),
  feeAmount: numeric("fee_amount", { precision: 12, scale: 2 }),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("member_unit_tenant_idx").on(t.tenantId)]);
