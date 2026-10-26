import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { memberUnit } from "./member-unit";
import { tenant } from "./tenant";

export const externalFormLink = pgTable(
  "external_form_link",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    tokenDigest: text("token_digest").notNull(),
    status: text("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().default(sql`now() + interval '7 days'`),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    rateLimitWindowStartedAt: timestamp("rate_limit_window_started_at", { withTimezone: true }),
    rateLimitCount: integer("rate_limit_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("external_form_link_token_digest_idx").on(table.tokenDigest),
    index("external_form_link_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const externalFormSubmission = pgTable(
  "external_form_submission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    linkId: uuid("link_id").notNull().references(() => externalFormLink.id),
    memberUnitId: uuid("member_unit_id").references(() => memberUnit.id),
    submissionNo: text("submission_no").notNull(),
    status: text("status").notNull().default("submitted"),
    payload: jsonb("payload").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("external_form_submission_tenant_no_idx").on(table.tenantId, table.submissionNo),
    index("external_form_submission_link_idx").on(table.linkId),
  ],
);

export const externalFormAttachment = pgTable(
  "external_form_attachment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenant.id),
    submissionId: uuid("submission_id").notNull().references(() => externalFormSubmission.id),
    originalName: text("original_name").notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    scanStatus: text("scan_status").notNull().default("pending"),
    archiveStatus: text("archive_status").notNull().default("temporary"),
    retainUntil: timestamp("retain_until", { withTimezone: true }).notNull().default(sql`now() + interval '30 days'`),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("external_form_attachment_submission_idx").on(table.submissionId)],
);
