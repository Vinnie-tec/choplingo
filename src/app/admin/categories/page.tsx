import { connection } from "next/server";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, recipes } from "@/lib/db/schema/recipe";

export const instant = false;

export default async function AdminCategoriesPage() {
  await connection();

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      recipeCount: count(recipes.id),
    })
    .from(categories)
    .leftJoin(recipes, eq(recipes.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return (
    <section>
      <div>
        <h1>Categories</h1>
        <p>Manage your recipe categories.</p>

        <Link href="/admin/categories/new">Add Category</Link>
      </div>

      <p>Total Categories: {allCategories.length}</p>

      {allCategories.length === 0 ? (
        <p>No categories have been created yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Recipes</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {allCategories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.slug}</td>
                <td>{category.description || "No description"}</td>
                <td>{category.recipeCount}</td>
                <td>
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
