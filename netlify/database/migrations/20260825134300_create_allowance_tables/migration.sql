CREATE TABLE "kids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"weekly_allowance_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY,
	"kid_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"memo" text,
	"from_allowance" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"google_sub" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"family_slug" text NOT NULL UNIQUE,
	"family_password_hash" text,
	"family_password_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "kids_user_id_idx" ON "kids" ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_kid_id_idx" ON "transactions" ("kid_id");--> statement-breakpoint
CREATE INDEX "transactions_allowance_check_idx" ON "transactions" ("kid_id","from_allowance","created_at");--> statement-breakpoint
ALTER TABLE "kids" ADD CONSTRAINT "kids_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_kid_id_kids_id_fkey" FOREIGN KEY ("kid_id") REFERENCES "kids"("id") ON DELETE CASCADE;