"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "@/app/admin/categories/actions";
import { useToast } from "@/components/toast-provider";

import type { categories } from "@/lib/db/schema/recipe";
import { updateCategory } from "@/app/admin/categories/actions";

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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Category Name</label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="e.g. Rice Dishes"
          required
          maxLength={100}
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="slug">Slug</label>

        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => setSlug(generateSlug(event.target.value))}
          placeholder="e.g. rice-dishes"
          required
          maxLength={120}
          disabled={isPending}
        />

        <small>This will be used in URLs and should be unique.</small>
      </div>

      <div>
        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the recipes in this category..."
          maxLength={500}
          disabled={isPending}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending
          ? isEditing
            ? "Saving..."
            : "Creating..."
          : isEditing
            ? "Update Category"
            : "Create Category"}
      </button>
    </form>
  );
}
