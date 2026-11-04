import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/recipe";
import CategoryForm from "@/components/admin/category-form";
import styles from "../../../admin.module.scss";

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
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>REFINE YOUR COLLECTION</p>
          <h1>Edit category</h1>
          <p className={styles.subtitle}>
            Update the name, URL, or description for{" "}
            <strong>{category.name}</strong>.
          </p>
        </div>
        <Link className={styles.secondaryButton} href="/admin/categories">
          <span aria-hidden="true">←</span> Back to categories
        </Link>
      </div>
      <CategoryForm key={category.id} category={category} />
    </main>
  );
}