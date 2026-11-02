
import type { RecipeStep } from "@/lib/db/schema/recipe";

type RecipeContext = {
  title: string;
  description: string;
  servings: number;
  preparationMinutes: number;
  cookingMinutes: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    notes: string | null;
  }[];
  instructions: RecipeStep[];
};

type MockCookingResponse = {
  answer: string;
  mode: "mock";
};

export function getMockCookingResponse(
  question: string,
  recipe: RecipeContext,
): MockCookingResponse {
  const normalizedQuestion = question.toLowerCase();

  const ingredientNames = recipe.ingredients
    .map((ingredient) => ingredient.name.toLowerCase());

  let answer: string;

  // Check whether the user is asking about a particular ingredient.
  const mentionedIngredient = recipe.ingredients.find((ingredient) =>
    normalizedQuestion.includes(ingredient.name.toLowerCase())
  );

  if (
    normalizedQuestion.includes("ingredient") ||
    normalizedQuestion.includes("substitute") ||
    normalizedQuestion.includes("instead of") ||
    normalizedQuestion.includes("replace")
  ) {
    const ingredients = recipe.ingredients
      .map((ingredient) => {
        return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
      })
      .join(", ");

    answer = mentionedIngredient
      ? `${mentionedIngredient.name} is included in ${recipe.title}. ` +
        `The recipe uses ${mentionedIngredient.quantity} ${mentionedIngredient.unit}. ` +
        "A suitable replacement depends on the flavour and texture you want. " +
        "If you tell me what ingredient you have available, I can help you compare options."
      : `The ingredients for ${recipe.title} are: ${ingredients}. ` +
        "Tell me which ingredient you want to replace so I can suggest an appropriate alternative.";
  } else if (
    normalizedQuestion.includes("instruction") ||
    normalizedQuestion.includes("step") ||
    normalizedQuestion.includes("how do i cook") ||
    normalizedQuestion.includes("how to prepare")
  ) {
    answer = recipe.instructions
      .map((step) => `${step.step}. ${step.instruction}`)
      .join("\n\n");
  } else if (
    normalizedQuestion.includes("spicy") ||
    normalizedQuestion.includes("pepper")
  ) {
    const pepperIngredients = recipe.ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes("pepper")
    );

    answer = pepperIngredients.length
      ? `Your ${recipe.title} recipe includes ${pepperIngredients
          .map((ingredient) => ingredient.name)
          .join(", ")}. You can reduce the quantity to control the heat. ` +
        "Add smaller amounts gradually and taste as you cook."
      : `I couldn't find a pepper ingredient listed in ${recipe.title}. ` +
        "You can still adjust any spicy ingredients you add, but check the recipe before making changes.";
  } else if (
    normalizedQuestion.includes("serving") ||
    normalizedQuestion.includes("servings") ||
    normalizedQuestion.includes("people") ||
    normalizedQuestion.includes("quantity")
  ) {
    answer = `${recipe.title} is originally designed to serve ${recipe.servings} people. ` +
      "To adjust the quantities, multiply each ingredient by " +
      "(your desired servings ÷ original servings). " +
      "You can use ChopLingo's serving calculator to do this automatically.";
  } else if (
    normalizedQuestion.includes("time") ||
    normalizedQuestion.includes("long")
  ) {
    answer = `For ${recipe.title}, preparation takes approximately ` +
      `${recipe.preparationMinutes} minutes, while cooking takes ` +
      `${recipe.cookingMinutes} minutes. ` +
      `That's approximately ${recipe.preparationMinutes + recipe.cookingMinutes} minutes altogether.`;
  } else if (
    normalizedQuestion.includes("ingredient list") ||
    normalizedQuestion.includes("what do i need") ||
    normalizedQuestion.includes("what ingredients")
  ) {
    answer = `Here are the ingredients for ${recipe.title}:\n\n` +
      recipe.ingredients
        .map((ingredient) =>
          `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
        )
        .join("\n");
  } else {
    answer = `You're asking about ${recipe.title}.\n\n` +
      `${recipe.description}\n\n` +
      `This recipe serves ${recipe.servings} people and takes approximately ` +
      `${recipe.preparationMinutes + recipe.cookingMinutes} minutes altogether.\n\n` +
      "Try asking me about its ingredients, cooking instructions, preparation time, or serving quantities.";
  }

  // Avoid unused-variable warnings if the ingredient list is empty.
  void ingredientNames;

  return {
    answer,
    mode: "mock",
  };
}
