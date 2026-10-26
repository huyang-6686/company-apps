CREATE TABLE IF NOT EXISTS "task_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_id" text NOT NULL,
	"task_type" text NOT NULL,
	"source_application_id" text NOT NULL,
	"publisher_unified_employee_id" text NOT NULL,
	"recipient_unified_employee_ids" jsonb NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"acceptance_status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "task_item_tenant_source_task_idx" ON "task_item" USING btree ("tenant_id","source_application_id","task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_item_tenant_status_idx" ON "task_item" USING btree ("tenant_id","status");