CREATE TABLE IF NOT EXISTS "external_form_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"original_name" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"scan_status" text DEFAULT 'pending' NOT NULL,
	"archive_status" text DEFAULT 'temporary' NOT NULL,
	"retain_until" timestamp with time zone DEFAULT now() + interval '30 days' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_form_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"token_digest" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '7 days' NOT NULL,
	"revoked_at" timestamp with time zone,
	"locked_at" timestamp with time zone,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"rate_limit_window_started_at" timestamp with time zone,
	"rate_limit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_form_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"link_id" uuid NOT NULL,
	"member_unit_id" uuid,
	"submission_no" text NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"payload" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_attachment" ADD CONSTRAINT "external_form_attachment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_attachment" ADD CONSTRAINT "external_form_attachment_submission_id_external_form_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."external_form_submission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_link" ADD CONSTRAINT "external_form_link_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_submission" ADD CONSTRAINT "external_form_submission_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_submission" ADD CONSTRAINT "external_form_submission_link_id_external_form_link_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."external_form_link"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_form_submission" ADD CONSTRAINT "external_form_submission_member_unit_id_member_unit_id_fk" FOREIGN KEY ("member_unit_id") REFERENCES "public"."member_unit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_form_attachment_submission_idx" ON "external_form_attachment" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "external_form_link_token_digest_idx" ON "external_form_link" USING btree ("token_digest");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_form_link_tenant_status_idx" ON "external_form_link" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "external_form_submission_tenant_no_idx" ON "external_form_submission" USING btree ("tenant_id","submission_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_form_submission_link_idx" ON "external_form_submission" USING btree ("link_id");