"use client";

import { startTransition, useMemo, useOptimistic, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DeleteRecipeButton from "@/components/admin/delete-recipe-button";
import { updateRecipeStatus } from "@/app/admin/recipes/actions";
import { useToast } from "@/components/toast-provider";

type AdminRecipe = {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  preparationMinutes: number;
  cookingMinutes: number;
  categoryName: string | null;
  status: string;
};

type RecipeListProps = {
  recipes: AdminRecipe[];
};

export default function AdminRecipeList({ recipes }: RecipeListProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const [pendingRecipeId, setPendingRecipeId] = useState<number | null>(null);

  const [optimisticRecipes, setOptimisticRecipes] = useOptimistic(
    recipes,
    (
      currentRecipes,
      update: { recipeId: number; status: "draft" | "published" },
    ) =>
      currentRecipes.map((recipe) =>
        recipe.id === update.recipeId
          ? { ...recipe, status: update.status }
          : recipe,
      ),
  );

  const router = useRouter();
  const { showToast } = useToast();

  const filteredRecipes = useMemo(() => {
    if (statusFilter === "all") return optimisticRecipes;

    return optimisticRecipes.filter((recipe) => recipe.status === statusFilter);
  }, [optimisticRecipes, statusFilter]);

  // Switch between published and draft.
  function handleStatusChange(recipe: AdminRecipe) {
    const nextStatus = recipe.status === "published" ? "draft" : "published";

    setPendingRecipeId(recipe.id);

    startTransition(async () => {
      // Immediately update the UI before contacting the server.
      setOptimisticRecipes({
        recipeId: recipe.id,
        status: nextStatus,
      });

      try {
        const result = await updateRecipeStatus({
          recipeId: recipe.id,
          status: nextStatus,
        });

        if (!result.success) {
          showToast(result.message, "error");
          return;
        }

        showToast(result.message, "success");

        router.refresh();
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setPendingRecipeId(null);
      }
    });
  }

  return (
    <section>
      <div>
        <label htmlFor="recipe-status">Filter by status:</label>

        <select
          id="recipe-status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as typeof statusFilter)
          }
        >
          <option value="all">All recipes</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <p>
          Showing {filteredRecipes.length} of {optimisticRecipes.length} recipes
        </p>
      </div>

      {filteredRecipes.length === 0 ? (
        <p>No recipes found for this status.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Recipe</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Preparation</th>
              <th>Cooking</th>
              <th>Status</th>
              <th>View</th>
              <th>Edit</th>
              <th>Publish / Unpublish</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.title}</td>
                <td>{recipe.categoryName}</td>
                <td>{recipe.difficulty}</td>
                <td>{recipe.preparationMinutes} mins</td>
                <td>{recipe.cookingMinutes} mins</td>

                <td>{recipe.status === "published" ? "Published" : "Draft"}</td>

                <td>
                  <Link href={`/recipes/${recipe.slug}`}>View</Link>
                </td>

                <td>
                  <Link href={`/admin/recipes/${recipe.id}/edit`}>Edit</Link>
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(recipe)}
                    disabled={pendingRecipeId === recipe.id}
                  >
                    {pendingRecipeId === recipe.id
                      ? "Updating..."
                      : recipe.status === "published"
                        ? "Unpublish"
                        : "Publish"}
                  </button>
                </td>

                <td>
                  <DeleteRecipeButton
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
