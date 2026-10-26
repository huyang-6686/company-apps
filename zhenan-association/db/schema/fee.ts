import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { memberUnit } from "./member-unit";
import { tenant } from "./tenant";

export const feeStandard = pgTable(
  "fee_standard",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    tier: text("tier").notNull(),
    year: integer("year").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    effectiveFrom: date("effective_from", { mode: "date" }).notNull(),
    resolutionAttachment: jsonb("resolution_attachment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("fee_standard_tenant_tier_year_idx").on(table.tenantId, table.tier, table.year)],
);

export const feeBill = pgTable(
  "fee_bill",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    memberUnitId: uuid("member_unit_id").notNull().references(() => memberUnit.id),
    year: integer("year").notNull(),
    amountDue: numeric("amount_due", { precision: 14, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 14, scale: 2 }).notNull().default("0"),
    dueDate: date("due_date", { mode: "date" }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("fee_bill_tenant_member_year_idx").on(table.tenantId, table.memberUnitId, table.year),
    index("fee_bill_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const feePayment = pgTable(
  "fee_payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    memberUnitId: uuid("member_unit_id").notNull().references(() => memberUnit.id),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull(),
    voucherMetadata: jsonb("voucher_metadata"),
    externalReference: text("external_reference"),
    status: text("status").notNull().default("recorded"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("fee_payment_tenant_member_idx").on(table.tenantId, table.memberUnitId)],
);
