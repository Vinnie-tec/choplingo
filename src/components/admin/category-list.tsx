"use client";

import { startTransition, useOptimistic, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteCategory } from "@/app/admin/categories/actions";
import { useToast } from "@/components/toast-provider";
import DeleteCategoryButton from "@/components/admin/delete-category-button";

import styles from "./category-list.module.scss";

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  recipeCount: number;
};

type CategoryListProps = {
  categories: AdminCategory[];
};

export default function AdminCategoryList({ categories }: CategoryListProps) {
  const [pendingCategoryId, setPendingCategoryId] = useState<number | null>(null);
  const [optimisticCategories, setOptimisticCategories] = useOptimistic(
    categories,
    (currentCategories, deletedCategoryId: number) =>
      currentCategories.filter(
        (category) => category.id !== deletedCategoryId,
      ),
  );
  const router = useRouter();
  const { showToast } = useToast();

  function handleDelete(categoryId: number) {
    setPendingCategoryId(categoryId);

    startTransition(async () => {
      setOptimisticCategories(categoryId);

      try {
        const result = await deleteCategory(categoryId);

        if (!result.success) {
          showToast(result.message, "error");
          return;
        }

        showToast(result.message, "success");
        router.refresh();
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setPendingCategoryId(null);
      }
    });
  }

  return (
    <section className={styles.list} aria-label="Recipe categories">
      <div className={styles.listHeader}>
        <div>
          <h2>Your categories</h2>
          <p>Clear collections help every recipe find its place.</p>
        </div>
        <span className={styles.countBadge}>
          {optimisticCategories.length}{" "}
          {optimisticCategories.length === 1 ? "category" : "categories"}
        </span>
      </div>

      {optimisticCategories.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">🎨</span>
          <h2>
            {categories.length === 0
              ? "Start with your first collection"
              : "All categories have been removed"}
          </h2>
          <p>
            {categories.length === 0
              ? "Create a category to start organising recipes and make your collection easier to explore."
              : "Add a new category whenever you’re ready to organise your recipes."}
          </p>
          <Link className={styles.emptyAction} href="/admin/categories/new">
            Add a category <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.categoryTable}>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Description</th>
                <th scope="col">Recipes</th>
                <th scope="col"><span className={styles.srOnly}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {optimisticCategories.map((category) => {
                const isPending = pendingCategoryId === category.id;

                return (
                  <tr key={category.id} aria-busy={isPending}>
                    <td>
                      <div className={styles.categoryCell}>
                        <span className={styles.categoryMark} aria-hidden="true">
                          {category.name.trim().charAt(0).toUpperCase() || "🎨"}
                        </span>
                        <div className={styles.categoryIdentity}>
                          <strong>{category.name}</strong>
                          <span>/{category.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.description}>
                        {category.description || "No description yet"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.recipeCount}>
                        <strong>{category.recipeCount}</strong>
                        {category.recipeCount === 1 ? " recipe" : " recipes"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          className={styles.editLink}
                          href={`/admin/categories/${category.id}/edit`}
                          aria-label={`Edit ${category.name}`}
                        >
                          Edit
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                          isPending={isPending}
                          disabled={pendingCategoryId !== null}
                          onConfirm={() => handleDelete(category.id)}
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
