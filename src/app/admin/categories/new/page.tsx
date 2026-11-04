import Link from "next/link";

import CategoryForm from "@/components/admin/category-form";
import styles from "../../admin.module.scss";

export default function NewCategoryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>BUILD YOUR COLLECTION</p>
          <h1>Create a category</h1>
          <p className={styles.subtitle}>
            Give a group of recipes a clear name and a little context.
          </p>
        </div>
        <Link className={styles.secondaryButton} href="/admin/categories">
          <span aria-hidden="true">←</span> Back to categories
        </Link>
      </div>
      <CategoryForm />
    </main>
  );
}