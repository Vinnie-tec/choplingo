
type MockCookingResponse = {
  answer: string;
  mode: "mock";
};

/**
 * Provides simulated cooking advice during development.
 *
 * This does NOT call an AI model. These responses are for
 * testing ChopLingo's backend and user interface without
 * spending money on API credits.
 */
export function getMockCookingResponse(
  question: string,
  recipeTitle: string,
): MockCookingResponse {
  const normalizedQuestion = question.toLowerCase();

  let answer: string;

  if (
    normalizedQuestion.includes("substitute") ||
    normalizedQuestion.includes("instead of") ||
    normalizedQuestion.includes("replace")
  ) {
    answer =
      "Ingredient substitutions depend on the recipe. For example, " +
      "you can omit crayfish if you don't have it, although the flavour " +
      "will be different. Tell me the specific ingredient you want to " +
      "replace for more targeted advice.";
  } else if (
    normalizedQuestion.includes("spicy") ||
    normalizedQuestion.includes("pepper")
  ) {
    answer =
      "To reduce the heat, use less scotch bonnet pepper and remove its " +
      "seeds if appropriate. Add pepper gradually, taste as you cook, " +
      "and remember that the other ingredients also affect the final flavour.";
  } else if (
    normalizedQuestion.includes("serving") ||
    normalizedQuestion.includes("servings") ||
    normalizedQuestion.includes("people") ||
    normalizedQuestion.includes("quantity")
  ) {
    answer =
      "Start by checking the recipe's original serving size. To serve " +
      "more or fewer people, multiply each ingredient quantity by " +
      "(your desired servings ÷ original servings). ChopLingo's serving " +
      "calculator can help you adjust the quantities.";
  } else if (
    normalizedQuestion.includes("cook") ||
    normalizedQuestion.includes("time") ||
    normalizedQuestion.includes("minutes")
  ) {
    answer =
      "Cooking time depends on your equipment, heat level, and ingredient " +
      "quantities. Follow the recipe's stated cooking time as a guide, " +
      "check the food as it cooks, and make sure ingredients are fully cooked.";
  } else {
    answer =
      `You're asking about ${recipeTitle}. During development, I'm using ` +
      "simulated responses rather than a live AI model. Try asking about " +
      "ingredient substitutions, reducing pepper, cooking time, or serving sizes.";
  }

  return {
    answer,
    mode: "mock",
  };
}
