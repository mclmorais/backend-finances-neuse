CREATE TABLE "category_monthly_planning" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"value" numeric,
	CONSTRAINT "unique_user_category_month" UNIQUE("user_id","category_id","month","year")
);
--> statement-breakpoint
ALTER TABLE "category_monthly_planning" ADD CONSTRAINT "category_monthly_planning_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;