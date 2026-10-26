import { pgTable, uuid, text, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenant } from "./tenant";

export const integrationConfig = pgTable("integration_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
  provider: text("provider").notNull(),
  configKey: text("config_key").notNull(),
  externalId: text("external_id").notNull(),
  secretRef: text("secret_ref").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("integration_config_tenant_provider_key_idx").on(t.tenantId, t.provider, t.configKey),
  index("integration_config_enabled_idx").on(t.provider, t.isEnabled),
]);
