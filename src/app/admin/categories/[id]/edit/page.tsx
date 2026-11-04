import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/recipe";
import CategoryForm from "@/components/admin/category-form";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export const instant = false;

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await connection();

  const { id } = await params;
  const categoryId = Number(id);

  // Validate the URL parameter.
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  // Fetch the category.
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    notFound();
  }

  return (
    <section>
      <div>
        <h1>Edit Category</h1>
        <p>Update the category details.</p>

        <Link href="/admin/categories">
          Back to Categories
        </Link>
      </div>

      <CategoryForm key={category.id} category={category} />
    </section>
  );
}