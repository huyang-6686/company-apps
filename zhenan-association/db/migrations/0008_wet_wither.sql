CREATE TABLE IF NOT EXISTS "integration_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"config_key" text NOT NULL,
	"external_id" text NOT NULL,
	"secret_ref" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_config" ADD CONSTRAINT "integration_config_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "integration_config_tenant_provider_key_idx" ON "integration_config" USING btree ("tenant_id","provider","config_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_config_enabled_idx" ON "integration_config" USING btree ("provider","is_enabled");