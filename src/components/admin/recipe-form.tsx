"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createRecipe, updateRecipe } from "@/app/admin/recipes/actions";

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
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <fieldset disabled={isPending}>
        <legend>Recipe Information</legend>

        <label htmlFor="title">Recipe title</label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={180}
          defaultValue={initialData?.title ?? ""}
        />

        <label htmlFor="slug">URL slug</label>
        <input
          id="slug"
          name="slug"
          required
          placeholder="nigerian-jollof-rice"
          defaultValue={initialData?.slug ?? ""}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={initialData?.description ?? ""}
        />

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

        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/food.jpg"
          defaultValue={initialData?.imageUrl ?? ""}
        />
      </fieldset>

      <fieldset disabled={isPending}>
        <legend>Cooking Information</legend>

        <label htmlFor="preparationMinutes">Preparation time (minutes)</label>
        <input
          id="preparationMinutes"
          name="preparationMinutes"
          type="number"
          min="1"
          required
          defaultValue={initialData?.preparationMinutes ?? ""}
        />

        <label htmlFor="cookingMinutes">Cooking time (minutes)</label>
        <input
          id="cookingMinutes"
          name="cookingMinutes"
          type="number"
          min="1"
          required
          defaultValue={initialData?.cookingMinutes ?? ""}
        />

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

        <div>
          <label htmlFor="status">Publication Status</label>

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

          <p>
            {status === "draft"
              ? "This recipe will not appear in the public recipe collection."
              : "This recipe will be available to users."}
          </p>
        </div>
      </fieldset>

      <fieldset disabled={isPending}>
        <legend>Ingredients</legend>

        {ingredients.map((item, index) => (
          <div key={index}>
            <h4>Ingredient {index + 1}</h4>

            <input
              placeholder="Ingredient name"
              value={item.name}
              onChange={(event) =>
                updateIngredient(index, "name", event.target.value)
              }
              required
            />

            <input
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
              placeholder="Unit (cups, grams, pieces...)"
              value={item.unit}
              onChange={(event) =>
                updateIngredient(index, "unit", event.target.value)
              }
              required
            />

            <input
              placeholder="Optional notes"
              value={item.notes}
              onChange={(event) =>
                updateIngredient(index, "notes", event.target.value)
              }
            />

            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setIngredients((current) =>
                    current.filter((_, i) => i !== index),
                  )
                }
              >
                Remove ingredient
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setIngredients((current) => [
              ...current,
              { name: "", quantity: "1", unit: "", notes: "" },
            ])
          }
        >
          Add ingredient
        </button>
      </fieldset>

      <fieldset disabled={isPending}>
        <legend>Cooking Instructions</legend>

        {instructions.map((item, index) => (
          <div key={index}>
            <h4>Step {index + 1}</h4>

            <textarea
              value={item.instruction}
              onChange={(event) => updateInstruction(index, event.target.value)}
              placeholder={`Describe cooking step ${index + 1}`}
              required
            />

            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setInstructions((current) =>
                    current.filter((_, i) => i !== index),
                  )
                }
              >
                Remove step
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setInstructions((current) => [...current, { instruction: "" }])
          }
        >
          Add instruction
        </button>
      </fieldset>

      <button type="submit" disabled={isPending}>
        {isPending
          ? initialData
            ? "Updating recipe..."
            : "Creating recipe..."
          : initialData
            ? "Update Recipe"
            : "Create Recipe"}
      </button>
    </form>
  );
}
