"use client";

import { startTransition, useMemo, useOptimistic, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DeleteRecipeButton from "@/components/admin/delete-recipe-button";
import {
  deleteRecipe,
  updateRecipeStatus,
} from "@/app/admin/recipes/actions";
import { useToast } from "@/components/toast-provider";

import styles from "./recipe-list.module.scss";

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

type OptimisticRecipeAction =
  | { type: "status"; recipeId: number; status: "draft" | "published" }
  | { type: "delete"; recipeId: number };

export default function AdminRecipeList({ recipes }: RecipeListProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [pendingRecipeId, setPendingRecipeId] = useState<number | null>(null);

  const [optimisticRecipes, setOptimisticRecipes] = useOptimistic(
    recipes,
    (currentRecipes, update: OptimisticRecipeAction) =>
      update.type === "delete"
        ? currentRecipes.filter((recipe) => recipe.id !== update.recipeId)
        : currentRecipes.map((recipe) =>
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

  function handleStatusChange(recipe: AdminRecipe) {
    const nextStatus = recipe.status === "published" ? "draft" : "published";
    setPendingRecipeId(recipe.id);

    startTransition(async () => {
      setOptimisticRecipes({
        type: "status",
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

  function handleDelete(recipeId: number) {
    setPendingRecipeId(recipeId);

    startTransition(async () => {
      setOptimisticRecipes({ type: "delete", recipeId });

      try {
        const result = await deleteRecipe(recipeId);

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
    <section className={styles.listSection} aria-label="Recipe collection">
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="recipe-status">
            Show
          </label>
          <select
            className={styles.filterSelect}
            id="recipe-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
          >
            <option value="all">All recipes</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        <p className={styles.resultCount} aria-live="polite">
          Showing <strong>{filteredRecipes.length}</strong> of{" "}
          <strong>{optimisticRecipes.length}</strong>
        </p>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">✦</span>
          <h2>
            {optimisticRecipes.length === 0
              ? "Your collection is ready for its first recipe"
              : "No recipes in this view"}
          </h2>
          <p>
            {optimisticRecipes.length === 0
              ? "Create a recipe and it will appear here."
              : "Try another status filter to see more of your collection."}
          </p>
          {optimisticRecipes.length === 0 && (
            <Link className={styles.emptyAction} href="/admin/recipes/new">
              Create a recipe <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.recipeTable}>
            <thead>
              <tr>
                <th scope="col">Recipe</th>
                <th scope="col">Category</th>
                <th scope="col">Difficulty</th>
                <th scope="col">Prep</th>
                <th scope="col">Cook</th>
                <th scope="col">Status</th>
                <th scope="col"><span className={styles.srOnly}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => {
                const isPending = pendingRecipeId === recipe.id;

                return (
                  <tr key={recipe.id} aria-busy={isPending}>
                    <td>
                      <div className={styles.recipeCell}>
                        <span className={styles.recipeMark} aria-hidden="true">
                          {recipe.title.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong className={styles.recipeTitle}>{recipe.title}</strong>
                          <span className={styles.recipeSlug}>/{recipe.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{recipe.categoryName ?? "Uncategorised"}</td>
                    <td>
                      <span className={`${styles.difficulty} ${styles[recipe.difficulty] ?? ""}`}>
                        {recipe.difficulty}
                      </span>
                    </td>
                    <td>{recipe.preparationMinutes} min</td>
                    <td>{recipe.cookingMinutes} min</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          recipe.status === "published"
                            ? styles.published
                            : styles.draft
                        }`}
                      >
                        <span className={styles.statusDot} aria-hidden="true" />
                        {recipe.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          className={styles.actionLink}
                          href={`/admin/recipes/${recipe.id}/edit`}
                          aria-label={`Edit ${recipe.title}`}
                        >
                          Edit
                        </Link>
                        <Link
                          className={styles.viewLink}
                          href={`/recipes/${recipe.slug}`}
                          aria-label={`View ${recipe.title}`}
                        >
                          View
                        </Link>
                        <button
                          className={styles.statusButton}
                          type="button"
                          onClick={() => handleStatusChange(recipe)}
                          disabled={pendingRecipeId !== null}
                        >
                          {isPending
                            ? "Saving…"
                            : recipe.status === "published"
                              ? "Unpublish"
                              : "Publish"}
                        </button>
                        <DeleteRecipeButton
                          recipeId={recipe.id}
                          recipeTitle={recipe.title}
                          isPending={isPending}
                          disabled={pendingRecipeId !== null}
                          onConfirm={() => handleDelete(recipe.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
