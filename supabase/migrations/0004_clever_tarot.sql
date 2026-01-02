CREATE TABLE "incomes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" integer NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"value" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;