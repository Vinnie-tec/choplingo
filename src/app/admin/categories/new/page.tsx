import Link from "next/link";

import CategoryForm from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <section>
      <div>
        <h1>Create Category</h1>
        <p>Add a new category to organise your recipes.</p>

        <Link href="/admin/categories">
          Back to Categories
        </Link>
      </div>

      <CategoryForm />
    </section>
  );
}