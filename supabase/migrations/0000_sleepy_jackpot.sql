CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL
);
