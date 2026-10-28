// import { config } from "dotenv";

// // Load environment variables before importing the database connection.
// config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  ingredients,
  recipes,
  recipeIngredients,
  type RecipeStep,
} from "./schema/recipe";

async function getOrCreateCategory(
  name: string,
  slug: string,
  description: string,
) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [category] = await db
    .insert(categories)
    .values({ name, slug, description })
    .returning();

  return category;
}

async function getOrCreateIngredient(name: string) {
  const existing = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [ingredient] = await db
    .insert(ingredients)
    .values({ name })
    .returning();

  return ingredient;
}

async function seed() {
  console.log("Seeding ChopLingo database...");

  // 1. Create or reuse categories.
  const riceCategory = await getOrCreateCategory(
    "Rice Dishes",
    "rice-dishes",
    "Nigerian dishes made with rice.",
  );

  const soupCategory = await getOrCreateCategory(
    "Soups",
    "soups",
    "Traditional Nigerian soups and stews.",
  );

  // 2. Define recipe instructions.
  const jollofInstructions: RecipeStep[] = [
    { step: 1, instruction: "Wash the rice and set it aside." },
    {
      step: 2,
      instruction:
        "Blend the tomatoes, red bell pepper, scotch bonnet pepper, and onion.",
    },
    {
      step: 3,
      instruction:
        "Heat the oil, sauté some onion, and cook the tomato mixture until reduced.",
    },
    {
      step: 4,
      instruction:
        "Add seasoning, stock, and rice. Stir and cook until the rice is tender, adding liquid as needed.",
    },
    {
      step: 5,
      instruction:
        "Taste, adjust the seasoning, and allow the rice to finish cooking.",
    },
  ];

  const egusiInstructions: RecipeStep[] = [
    {
      step: 1,
      instruction:
        "Prepare the egusi mixture and wash the vegetables. Set them aside.",
    },
    {
      step: 2,
      instruction: "Heat palm oil in a pot and gently cook chopped onion.",
    },
    {
      step: 3,
      instruction: "Add the egusi mixture and cook, stirring as needed.",
    },
    {
      step: 4,
      instruction:
        "Add stock and your chosen protein, then simmer until cooked through.",
    },
    {
      step: 5,
      instruction:
        "Add the vegetables, adjust the seasoning, and simmer until done.",
    },
  ];

  // 3. Define the recipes and their ingredient quantities.
  const recipeData = [
    {
      title: "Nigerian Jollof Rice",
      slug: "nigerian-jollof-rice",
      description:
        "A beloved West African rice dish cooked in a rich tomato and pepper sauce.",
      categoryId: riceCategory.id,
      preparationMinutes: 20,
      cookingMinutes: 45,
      servings: 4,
      difficulty: "medium",
      instructions: jollofInstructions,
      ingredients: [
        { name: "Rice", quantity: 2, unit: "cups" },
        { name: "Tomatoes", quantity: 4, unit: "medium" },
        { name: "Red bell pepper", quantity: 2, unit: "medium" },
        { name: "Scotch bonnet pepper", quantity: 1, unit: "piece" },
        { name: "Onion", quantity: 2, unit: "medium" },
        { name: "Vegetable oil", quantity: 0.25, unit: "cup" },
        { name: "Stock", quantity: 3, unit: "cups" },
      ],
    },
    {
      title: "Nigerian Egusi Soup",
      slug: "nigerian-egusi-soup",
      description:
        "A rich Nigerian soup made with ground melon seeds, leafy vegetables, and stock.",
      categoryId: soupCategory.id,
      preparationMinutes: 25,
      cookingMinutes: 40,
      servings: 4,
      difficulty: "medium",
      instructions: egusiInstructions,
      ingredients: [
        { name: "Ground egusi", quantity: 2, unit: "cups" },
        { name: "Palm oil", quantity: 0.5, unit: "cup" },
        { name: "Onion", quantity: 1, unit: "medium" },
        { name: "Stock", quantity: 3, unit: "cups" },
        { name: "Spinach", quantity: 3, unit: "cups" },
        { name: "Ground crayfish", quantity: 2, unit: "tablespoons" },
        { name: "Salt", quantity: 1, unit: "teaspoon" },
      ],
    },
  ];

  // 4. Create each recipe if it does not already exist.
  for (const recipeDataItem of recipeData) {
    const existingRecipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.slug, recipeDataItem.slug))
      .limit(1);

    let recipe;

    if (existingRecipe.length > 0) {
      recipe = existingRecipe[0];
      console.log(`Recipe already exists: ${recipe.title}`);
    } else {
      const [createdRecipe] = await db
        .insert(recipes)
        .values({
          title: recipeDataItem.title,
          slug: recipeDataItem.slug,
          description: recipeDataItem.description,
          categoryId: recipeDataItem.categoryId,
          preparationMinutes: recipeDataItem.preparationMinutes,
          cookingMinutes: recipeDataItem.cookingMinutes,
          servings: recipeDataItem.servings,
          difficulty: recipeDataItem.difficulty,
          instructions: recipeDataItem.instructions,
        })
        .returning();

      recipe = createdRecipe;
      console.log(`Created recipe: ${recipe.title}`);
    }

    // 5. Add the recipe's ingredient relationships.
    for (const item of recipeDataItem.ingredients) {
      const ingredient = await getOrCreateIngredient(item.name);

      const existingRelationship = await db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipe.id))
        .limit(100);

      const alreadyLinked = existingRelationship.some(
        (relationship) => relationship.ingredientId === ingredient.id,
      );

      if (!alreadyLinked) {
        await db.insert(recipeIngredients).values({
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
        });
      }
    }
  }

  console.log("ChopLingo database seeding completed!");
}

seed().catch((error) => {
  console.error("Database seeding failed:", error);
  process.exitCode = 1;
});
