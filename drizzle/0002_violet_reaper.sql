CREATE TABLE "recipe_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_reviews_rating_range" CHECK ("recipe_reviews"."rating" >= 1 AND "recipe_reviews"."rating" <= 5)
);
--> statement-breakpoint
ALTER TABLE "recipe_reviews" ADD CONSTRAINT "recipe_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_reviews" ADD CONSTRAINT "recipe_reviews_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_reviews_user_recipe_unique" ON "recipe_reviews" USING btree ("user_id","recipe_id");