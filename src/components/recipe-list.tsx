"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import FavouriteButton from "@/components/favourite-button";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  description: string;
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  difficulty: string;
  categoryName: string;
  isFavourite: boolean;
};

type RecipeListProps = {
  recipes: Recipe[];
};

export default function RecipeList({ recipes }: RecipeListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Build the category options from the recipes we already fetched.
  const categoryNames = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.categoryName))].sort(),
    [recipes],
  );

  // Search and category filtering happen in the browser.
  const filteredRecipes = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" || recipe.categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [recipes, search, selectedCategory]);

  return (
    <section aria-label="Browse recipes">
      <div>
        <label htmlFor="recipe-search">Search recipes</label>
        <input
          id="recipe-search"
          type="search"
          placeholder="Try jollof rice or egusi..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label htmlFor="recipe-category">Filter by category</label>
        <select
          id="recipe-category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="all">All categories</option>

          {categoryNames.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <p aria-live="polite">
        {filteredRecipes.length}{" "}
        {filteredRecipes.length === 1 ? "recipe" : "recipes"} found
      </p>

      {filteredRecipes.length > 0 ? (
        <div>
          {filteredRecipes.map((recipe) => (
            <article key={recipe.id}>
              <p>{recipe.categoryName}</p>

              <h2>
                <Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
              </h2>

              <p>{recipe.description}</p>
              <p>Preparation: {recipe.preparationMinutes} minutes</p>
              <p>Cooking: {recipe.cookingMinutes} minutes</p>
              <p>Serves: {recipe.servings}</p>
              <p>Difficulty: {recipe.difficulty}</p>
              
              <FavouriteButton
                recipeId={recipe.id}
                initialIsFavourite={recipe.isFavourite}
              />
            </article>
          ))}
        </div>
      ) : (
        <div>
          <h2>No recipes found</h2>
          <p>Try another search term or choose a different category.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
