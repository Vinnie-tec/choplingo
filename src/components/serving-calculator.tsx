
"use client";

import { useState } from "react";

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  notes: string | null;
};

type ServingCalculatorProps = {
  originalServings: number;
  ingredients: Ingredient[];
};

export default function ServingCalculator({
  originalServings,
  ingredients,
}: ServingCalculatorProps) {
  const [servings, setServings] = useState(originalServings);

  // Scale each ingredient in proportion to the serving count.
  function scaleQuantity(quantity: number) {
    return Number(
      (quantity * servings / originalServings).toFixed(2),
    );
  }

  return (
    <section aria-labelledby="ingredients-heading">
      <h2 id="ingredients-heading">Ingredients</h2>

      <div>
        <button
          type="button"
          onClick={() => setServings((current) => Math.max(1, current - 1))}
          disabled={servings <= 1}
          aria-label="Decrease servings"
        >
          −
        </button>

        <span aria-live="polite">
          {servings} servings
        </span>

        <button
          type="button"
          onClick={() => setServings((current) => Math.min(100, current + 1))}
          disabled={servings >= 100}
          aria-label="Increase servings"
        >
          +
        </button>
      </div>

      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.name}>
            {scaleQuantity(ingredient.quantity)} {ingredient.unit}{" "}
            {ingredient.name}
            {ingredient.notes ? ` — ${ingredient.notes}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
