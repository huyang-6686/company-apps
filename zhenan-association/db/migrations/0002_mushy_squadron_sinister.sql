CREATE TABLE IF NOT EXISTS "fee_bill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"member_unit_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"amount_due" numeric(14, 2) NOT NULL,
	"amount_paid" numeric(14, 2) DEFAULT '0' NOT NULL,
	"due_date" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fee_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"member_unit_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paid_at" timestamp with time zone NOT NULL,
	"voucher_metadata" jsonb,
	"external_reference" text,
	"status" text DEFAULT 'recorded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fee_standard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"year" integer NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"effective_from" date NOT NULL,
	"resolution_attachment" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fee_bill" ADD CONSTRAINT "fee_bill_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fee_bill" ADD CONSTRAINT "fee_bill_member_unit_id_member_unit_id_fk" FOREIGN KEY ("member_unit_id") REFERENCES "public"."member_unit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fee_payment" ADD CONSTRAINT "fee_payment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fee_payment" ADD CONSTRAINT "fee_payment_member_unit_id_member_unit_id_fk" FOREIGN KEY ("member_unit_id") REFERENCES "public"."member_unit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fee_standard" ADD CONSTRAINT "fee_standard_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fee_bill_tenant_member_year_idx" ON "fee_bill" USING btree ("tenant_id","member_unit_id","year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fee_bill_tenant_status_idx" ON "fee_bill" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fee_payment_tenant_member_idx" ON "fee_payment" USING btree ("tenant_id","member_unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fee_standard_tenant_tier_year_idx" ON "fee_standard" USING btree ("tenant_id","tier","year");