"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "@/app/admin/categories/actions";
import { useToast } from "@/components/toast-provider";

import type { categories } from "@/lib/db/schema/recipe";
import { updateCategory } from "@/app/admin/categories/actions";
import styles from "./category-form.module.scss";

type Category = typeof categories.$inferSelect;

type CategoryFormProps = {
  category?: Category;
};

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();
  const isEditing = category !== undefined;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  // Generate a URL-friendly slug from the category name.
  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    // Automatically update the slug as the name changes.
    setSlug(generateSlug(value));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = isEditing
        ? await updateCategory({
            categoryId: category.id,
            name,
            slug,
            description,
          })
        : await createCategory({
            name,
            slug,
            description,
          });

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast(result.message, "success");

      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formCard}>
        <div className={styles.formIntro}>
          <span className={styles.formIcon} aria-hidden="true">🎨</span>
          <div>
            <h2>{isEditing ? "Category details" : "Make it memorable"}</h2>
            <p>
              {isEditing
                ? "Keep the details clear so people can find the right recipes."
                : "A good category name makes it easy to find the perfect dish."}
            </p>
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="name">Category name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Rice dishes"
              required
              maxLength={100}
              disabled={isPending}
              autoComplete="off"
            />
            <small>A short, recognisable name for this collection.</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="slug">URL slug</label>
            <div className={styles.slugInput}>
              <span aria-hidden="true">/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(generateSlug(event.target.value))}
                placeholder="rice-dishes"
                required
                maxLength={120}
                disabled={isPending}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <small>Generated from the name; you can customise it. Must be unique.</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What kind of recipes belong in this collection?"
              maxLength={500}
              rows={5}
              disabled={isPending}
            />
            <div className={styles.descriptionMeta}>
              <small>Give visitors a little context about the collection.</small>
              <span>{description.length}/500</span>
            </div>
          </div>
        </div>

        <div className={styles.preview}>
          <span className={styles.previewMark} aria-hidden="true">
            {name.trim().charAt(0).toUpperCase() || "🎨"}
          </span>
          <div className={styles.previewCopy}>
            <span className={styles.previewLabel}>COLLECTION PREVIEW</span>
            <strong>{name.trim() || "Your category name"}</strong>
            <span className={styles.previewSlug}>/{slug || "your-category"}</span>
          </div>
        </div>
      </div>

      <div className={styles.formFooter}>
        <p>Your category will be available throughout the recipe collection.</p>
        <button className={styles.submitButton} type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving changes…"
              : "Creating category…"
            : isEditing
              ? "Save changes"
              : "Create category"}
          {!isPending && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </form>
  );
}
