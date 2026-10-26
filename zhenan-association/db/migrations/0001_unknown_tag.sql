ALTER TABLE "audit_event" ADD COLUMN "trace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_event" ADD COLUMN "summary" jsonb;--> statement-breakpoint
ALTER TABLE "member_unit" ADD COLUMN "credit_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "permission_binding" ADD COLUMN "action" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_id_person_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission_binding" ADD CONSTRAINT "permission_binding_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission_binding" ADD CONSTRAINT "permission_binding_resource_id_permission_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."permission_resource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "member_unit" ADD CONSTRAINT "member_unit_credit_code_unique" UNIQUE("credit_code");