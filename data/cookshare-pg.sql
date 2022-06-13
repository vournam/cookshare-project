CREATE TABLE "category" (
  "category_name" TEXT PRIMARY KEY
);

CREATE TABLE "ingredient" (
  "ingredient_name" TEXT PRIMARY KEY
);

CREATE TABLE "level" (
  "level" TEXT PRIMARY KEY
);

CREATE TABLE "recipe_box" (
  "id" SERIAL PRIMARY KEY
);

CREATE TABLE "user" (
  "user_id" INTEGER NOT NULL,
  "alias" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "surname" TEXT NOT NULL,
  "recipe_box" INTEGER NOT NULL,
  PRIMARY KEY ("user_id", "alias")
);

CREATE INDEX "idx_user__recipe_box" ON "user" ("recipe_box");

ALTER TABLE "user" ADD CONSTRAINT "fk_user__recipe_box" FOREIGN KEY ("recipe_box") REFERENCES "recipe_box" ("id");

CREATE TABLE "recipe" (
  "recipe_id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "belongs_to_user_user_id" INTEGER NOT NULL,
  "belongs_to_user_alias" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "img" TEXT NOT NULL,
  "ingredient" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "time" INTEGER,
  "portions" INTEGER,
  "level" TEXT NOT NULL
);

CREATE INDEX "idx_recipe__belongs_to_user_user_id_belongs_to_user_alias" ON "recipe" ("belongs_to_user_user_id", "belongs_to_user_alias");

CREATE INDEX "idx_recipe__category" ON "recipe" ("category");

CREATE INDEX "idx_recipe__ingredient" ON "recipe" ("ingredient");

CREATE INDEX "idx_recipe__level" ON "recipe" ("level");

ALTER TABLE "recipe" ADD CONSTRAINT "fk_recipe__belongs_to_user_user_id__belongs_to_user_alias" FOREIGN KEY ("belongs_to_user_user_id", "belongs_to_user_alias") REFERENCES "user" ("user_id", "alias") ON DELETE CASCADE;

ALTER TABLE "recipe" ADD CONSTRAINT "fk_recipe__category" FOREIGN KEY ("category") REFERENCES "category" ("category_name") ON DELETE CASCADE;

ALTER TABLE "recipe" ADD CONSTRAINT "fk_recipe__ingredient" FOREIGN KEY ("ingredient") REFERENCES "ingredient" ("ingredient_name") ON DELETE CASCADE;

ALTER TABLE "recipe" ADD CONSTRAINT "fk_recipe__level" FOREIGN KEY ("level") REFERENCES "level" ("level") ON DELETE CASCADE;

CREATE TABLE "comment" (
  "comment_id" SERIAL PRIMARY KEY,
  "comment" TEXT NOT NULL,
  "user_comments_user_id" INTEGER NOT NULL,
  "user_comments_alias" TEXT NOT NULL,
  "recipe_comment" INTEGER NOT NULL
);

CREATE INDEX "idx_comment__recipe_comment" ON "comment" ("recipe_comment");

CREATE INDEX "idx_comment__user_comments_user_id_user_comments_alias" ON "comment" ("user_comments_user_id", "user_comments_alias");

ALTER TABLE "comment" ADD CONSTRAINT "fk_comment__recipe_comment" FOREIGN KEY ("recipe_comment") REFERENCES "recipe" ("recipe_id") ON DELETE CASCADE;

ALTER TABLE "comment" ADD CONSTRAINT "fk_comment__user_comments_user_id__user_comments_alias" FOREIGN KEY ("user_comments_user_id", "user_comments_alias") REFERENCES "user" ("user_id", "alias") ON DELETE CASCADE;

CREATE TABLE "rating" (
  "rating_id" SERIAL PRIMARY KEY,
  "rating" TEXT NOT NULL,
  "user_ratings_user_id" INTEGER NOT NULL,
  "user_ratings_alias" TEXT NOT NULL,
  "recipe_rating" INTEGER NOT NULL
);

CREATE INDEX "idx_rating__recipe_rating" ON "rating" ("recipe_rating");

CREATE INDEX "idx_rating__user_ratings_user_id_user_ratings_alias" ON "rating" ("user_ratings_user_id", "user_ratings_alias");

ALTER TABLE "rating" ADD CONSTRAINT "fk_rating__recipe_rating" FOREIGN KEY ("recipe_rating") REFERENCES "recipe" ("recipe_id") ON DELETE CASCADE;

ALTER TABLE "rating" ADD CONSTRAINT "fk_rating__user_ratings_user_id__user_ratings_alias" FOREIGN KEY ("user_ratings_user_id", "user_ratings_alias") REFERENCES "user" ("user_id", "alias") ON DELETE CASCADE;

CREATE TABLE "recipe_recipe_box" (
  "recipe" INTEGER NOT NULL,
  "recipe_box" INTEGER NOT NULL,
  PRIMARY KEY ("recipe", "recipe_box")
);

CREATE INDEX "idx_recipe_recipe_box" ON "recipe_recipe_box" ("recipe_box");

ALTER TABLE "recipe_recipe_box" ADD CONSTRAINT "fk_recipe_recipe_box__recipe" FOREIGN KEY ("recipe") REFERENCES "recipe" ("recipe_id");

ALTER TABLE "recipe_recipe_box" ADD CONSTRAINT "fk_recipe_recipe_box__recipe_box" FOREIGN KEY ("recipe_box") REFERENCES "recipe_box" ("id");

CREATE TABLE "recipe_user" (
  "recipe" INTEGER NOT NULL,
  "user_user_id" INTEGER NOT NULL,
  "user_alias" TEXT NOT NULL,
  PRIMARY KEY ("recipe", "user_user_id", "user_alias")
);

CREATE INDEX "idx_recipe_user" ON "recipe_user" ("user_user_id", "user_alias");

ALTER TABLE "recipe_user" ADD CONSTRAINT "fk_recipe_user__recipe" FOREIGN KEY ("recipe") REFERENCES "recipe" ("recipe_id");

ALTER TABLE "recipe_user" ADD CONSTRAINT "fk_recipe_user__user_user_id__user_alias" FOREIGN KEY ("user_user_id", "user_alias") REFERENCES "user" ("user_id", "alias")