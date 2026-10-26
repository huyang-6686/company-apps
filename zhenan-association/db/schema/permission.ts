import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";
import { person } from "./person";

export const permissionResource = pgTable("permission_resource", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  code: text("code").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("permission_resource_tenant_code_idx").on(t.tenantId, t.code)]);

export const permissionBinding = pgTable("permission_binding", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  personId: uuid("person_id").notNull().references(() => person.id),
  resourceId: uuid("resource_id").notNull().references(() => permissionResource.id),
  action: text("action").notNull(),
  dataScope: text("data_scope").notNull().default("self"),
  source: text("source").notNull().default("yuguang"),
  syncBatchId: uuid("sync_batch_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("permission_binding_tenant_person_idx").on(t.tenantId, t.personId)]);
