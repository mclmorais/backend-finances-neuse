CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"name" text NOT NULL
);
