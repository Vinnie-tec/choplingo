
"use client";

import { useState } from "react";

import styles from "./serving-calculator.module.scss";

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
    <section
      aria-labelledby="ingredients-heading"
      className={styles.calculator}
    >
      <h2 id="ingredients-heading" className={styles.heading}>Ingredients</h2>

      <div className={styles.servingControl}>
        <button
          className={styles.servingButton}
          type="button"
          onClick={() => setServings((current) => Math.max(1, current - 1))}
          disabled={servings <= 1}
          aria-label="Decrease servings"
        >
          −
        </button>

        <span aria-live="polite" className={styles.servingCount}>
          {servings} servings
        </span>

        <button
          className={styles.servingButton}
          type="button"
          onClick={() => setServings((current) => Math.min(100, current + 1))}
          disabled={servings >= 100}
          aria-label="Increase servings"
        >
          +
        </button>
      </div>

      <ul className={styles.ingredientList}>
        {ingredients.map((ingredient) => (
          <li key={ingredient.name} className={styles.ingredient}>
            {scaleQuantity(ingredient.quantity)} {ingredient.unit}{" "}
            {ingredient.name}
            {ingredient.notes ? ` — ${ingredient.notes}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
