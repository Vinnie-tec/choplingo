"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createRecipe, updateRecipe } from "@/app/admin/recipes/actions";
import styles from "./recipe-form.module.scss";

type Category = {
  id: number;
  name: string;
};

type RecipeDifficulty = "easy" | "medium" | "hard";

type InitialRecipeData = {
  id: number;
  title: string;
  slug: string;
  description: string;
  categoryId: number;
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  imageUrl: string | null;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    notes: string | null;
  }[];
  instructions: {
    step: number;
    instruction: string;
  }[];
  status: "draft" | "published";
};

type IngredientInput = {
  name: string;
  quantity: string;
  unit: string;
  notes: string;
};

type InstructionInput = {
  instruction: string;
};

type RecipeFormProps = {
  categories: Category[];
  initialData?: InitialRecipeData;
};

export default function RecipeForm({
  categories,
  initialData,
}: RecipeFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft",
  );

  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialData
      ? initialData.ingredients.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit,
          notes: item.notes ?? "",
        }))
      : [{ name: "", quantity: "1", unit: "", notes: "" }],
  );

  const [instructions, setInstructions] = useState<InstructionInput[]>(
    initialData
      ? initialData.instructions.map((item) => ({
          instruction: item.instruction,
        }))
      : [{ instruction: "" }],
  );

  function updateIngredient(
    index: number,
    field: keyof IngredientInput,
    value: string,
  ) {
    setIngredients((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((current) =>
      current.map((item, i) => (i === index ? { instruction: value } : item)),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    const recipeData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      categoryId: Number(formData.get("categoryId")),
      preparationMinutes: Number(formData.get("preparationMinutes")),
      cookingMinutes: Number(formData.get("cookingMinutes")),
      servings: Number(formData.get("servings")),
      difficulty: formData.get("difficulty"),
      imageUrl: formData.get("imageUrl"),
      status,

      ingredients: ingredients.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        notes: item.notes || undefined,
      })),

      instructions: instructions.map((item, index) => ({
        step: index + 1,
        instruction: item.instruction,
      })),
    };

    startTransition(async () => {
      const result = initialData
        ? await updateRecipe(initialData.id, recipeData)
        : await createRecipe(recipeData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      router.push("/admin/recipes");
      router.refresh();
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      {message && <p className={styles.successMessage} role="status">{message}</p>}

      <fieldset className={styles.fieldset} disabled={isPending}>
        <legend className={styles.legend}>Recipe information</legend>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Recipe title</label>
            <input
              id="title"
              name="title"
              required
              minLength={3}
              maxLength={180}
              placeholder="e.g. Sunday jollof rice"
              defaultValue={initialData?.title ?? ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="slug">URL slug</label>
            <input
              id="slug"
              name="slug"
              required
              placeholder="nigerian-jollof-rice"
              defaultValue={initialData?.slug ?? ""}
            />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="What makes this dish worth cooking?"
              defaultValue={initialData?.description ?? ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={initialData?.categoryId ?? ""}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="imageUrl">Image URL <span>(optional)</span></label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/food.jpg"
              defaultValue={initialData?.imageUrl ?? ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isPending}>
        <legend className={styles.legend}>Cooking details</legend>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="preparationMinutes">Preparation time</label>
            <div className={styles.inputWithUnit}>
              <input
                id="preparationMinutes"
                name="preparationMinutes"
                type="number"
                min="1"
                required
                defaultValue={initialData?.preparationMinutes ?? ""}
              />
              <span>min</span>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="cookingMinutes">Cooking time</label>
            <div className={styles.inputWithUnit}>
              <input
                id="cookingMinutes"
                name="cookingMinutes"
                type="number"
                min="1"
                required
                defaultValue={initialData?.cookingMinutes ?? ""}
              />
              <span>min</span>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="servings">Servings</label>
            <input
              id="servings"
              name="servings"
              type="number"
              min="1"
              max="100"
              defaultValue={initialData?.servings ?? 4}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={initialData?.difficulty ?? "medium"}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className={`${styles.statusField} ${styles.fullWidth}`}>
            <div>
              <label htmlFor="status">Publication status</label>
              <p>
                {status === "draft"
                  ? "Drafts stay private until you’re ready to share."
                  : "Published recipes are visible in the public collection."}
              </p>
            </div>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "draft" | "published")
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isPending}>
        <legend className={styles.legend}>Ingredients</legend>
        <p className={styles.sectionHint}>List each ingredient and its amount.</p>
        <div className={styles.repeatList}>
          {ingredients.map((item, index) => (
            <div className={styles.repeatCard} key={index}>
              <div className={styles.repeatHeading}>
                <h3>Ingredient {index + 1}</h3>
                {ingredients.length > 1 && (
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() =>
                      setIngredients((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className={styles.ingredientGrid}>
                <input
                  aria-label={`Ingredient ${index + 1} name`}
                  placeholder="Ingredient name"
                  value={item.name}
                  onChange={(event) =>
                    updateIngredient(index, "name", event.target.value)
                  }
                  required
                />
                <input
                  aria-label={`Ingredient ${index + 1} quantity`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(event) =>
                    updateIngredient(index, "quantity", event.target.value)
                  }
                  required
                />
                <input
                  aria-label={`Ingredient ${index + 1} unit`}
                  placeholder="Unit (cups, grams...)"
                  value={item.unit}
                  onChange={(event) =>
                    updateIngredient(index, "unit", event.target.value)
                  }
                  required
                />
                <input
                  aria-label={`Ingredient ${index + 1} notes`}
                  placeholder="Optional notes"
                  value={item.notes}
                  onChange={(event) =>
                    updateIngredient(index, "notes", event.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <button
          className={styles.addButton}
          type="button"
          onClick={() =>
            setIngredients((current) => [
              ...current,
              { name: "", quantity: "1", unit: "", notes: "" },
            ])
          }
        >
          <span aria-hidden="true">＋</span> Add ingredient
        </button>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isPending}>
        <legend className={styles.legend}>Cooking instructions</legend>
        <p className={styles.sectionHint}>Break the recipe into clear steps.</p>
        <div className={styles.repeatList}>
          {instructions.map((item, index) => (
            <div className={styles.stepCard} key={index}>
              <div className={styles.repeatHeading}>
                <h3><span className={styles.stepNumber}>{index + 1}</span> Step {index + 1}</h3>
                {instructions.length > 1 && (
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() =>
                      setInstructions((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                aria-label={`Cooking step ${index + 1}`}
                value={item.instruction}
                onChange={(event) => updateInstruction(index, event.target.value)}
                placeholder={`Describe cooking step ${index + 1}`}
                rows={3}
                required
              />
            </div>
          ))}
        </div>
        <button
          className={styles.addButton}
          type="button"
          onClick={() =>
            setInstructions((current) => [...current, { instruction: "" }])
          }
        >
          <span aria-hidden="true">＋</span> Add instruction
        </button>
      </fieldset>

      <div className={styles.formFooter}>
        <p>Your changes will be saved to the ChopLingo collection.</p>
        <button className={styles.submitButton} type="submit" disabled={isPending}>
          {isPending
            ? initialData
              ? "Updating recipe…"
              : "Creating recipe…"
            : initialData
              ? "Save changes"
              : "Create recipe"}
          {!isPending && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </form>
  );
}
