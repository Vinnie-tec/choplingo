"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeleteRecipeButton from "@/components/admin/delete-recipe-button";

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

  const filteredRecipes = useMemo(() => {
    if (statusFilter === "all") return recipes;

    return recipes.filter((recipe) => recipe.status === statusFilter);
  }, [recipes, statusFilter]);

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
          Showing {filteredRecipes.length} of {recipes.length} recipes
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
                <td>
                  {recipe.status === "published" ? "Published" : "Draft"}
                </td>
                <td>
                  <Link href={`/recipes/${recipe.slug}`}>View</Link>
                </td>
                <td>
                  <Link href={`/admin/recipes/${recipe.id}/edit`}>Edit</Link>
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