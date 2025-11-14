ALTER TABLE "categories" DROP COLUMN "user_id";
ALTER TABLE "categories" ADD COLUMN "user_id" uuid NOT NULL;