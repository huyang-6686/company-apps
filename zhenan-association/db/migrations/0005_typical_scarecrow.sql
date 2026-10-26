CREATE TABLE IF NOT EXISTS "notification_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"source_application_id" text NOT NULL,
	"recipient_unified_employee_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"deep_link" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"failure_reason" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_event" ADD CONSTRAINT "notification_event_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_event_tenant_source_event_idx" ON "notification_event" USING btree ("tenant_id","source_application_id","event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_event_recipient_status_idx" ON "notification_event" USING btree ("tenant_id","recipient_unified_employee_id","status");