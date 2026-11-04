"use client";

import { startTransition, useOptimistic, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DeleteReviewButton from "@/components/admin/delete-review-button";
import { deleteReview } from "@/app/admin/reviews/actions";
import { useToast } from "@/components/toast-provider";

import styles from "./review-list.module.scss";

type AdminReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  recipeTitle: string;
  recipeSlug: string;
  reviewerName: string;
  reviewerEmail: string;
};

type ReviewListProps = {
  reviews: AdminReview[];
  hasFilters: boolean;
};

export default function AdminReviewList({
  reviews,
  hasFilters,
}: ReviewListProps) {
  const [pendingReviewId, setPendingReviewId] = useState<number | null>(null);
  const [optimisticReviews, setOptimisticReviews] = useOptimistic(
    reviews,
    (currentReviews, deletedReviewId: number) =>
      currentReviews.filter((review) => review.id !== deletedReviewId),
  );
  const router = useRouter();
  const { showToast } = useToast();

  function handleDelete(reviewId: number) {
    setPendingReviewId(reviewId);

    startTransition(async () => {
      setOptimisticReviews(reviewId);

      try {
        const result = await deleteReview(reviewId);

        if (!result.success) {
          showToast(result.message, "error");
          return;
        }

        showToast(result.message, "success");
        router.refresh();
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setPendingReviewId(null);
      }
    });
  }

  if (optimisticReviews.length === 0) {
    return (
      <section className={styles.emptyState}>
        <span className={styles.emptyIcon} aria-hidden="true">✦</span>
        <h2>{hasFilters ? "No reviews match these filters" : "No reviews yet"}</h2>
        <p>
          {hasFilters
            ? "Try changing the recipe search or selecting a different rating."
            : "When readers share feedback on your recipes, it will appear here."}
        </p>
        {hasFilters && (
          <Link className={styles.clearLink} href="/admin/reviews">
            Clear filters <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className={styles.reviewList} aria-label="Submitted reviews">
      {optimisticReviews.map((review) => {
        const isPending = pendingReviewId === review.id;

        return (
          <article
            className={styles.reviewCard}
            key={review.id}
            aria-busy={isPending}
          >
            <div className={styles.reviewTopline}>
              <div className={styles.recipe}>
                <span className={styles.recipeMark} aria-hidden="true">
                  {review.recipeTitle.trim().charAt(0).toUpperCase() || "✦"}
                </span>
                <div className={styles.recipeInfo}>
                  <Link
                    className={styles.recipeLink}
                    href={`/recipes/${review.recipeSlug}`}
                  >
                    {review.recipeTitle}
                  </Link>
                  <span className={styles.reviewDate}>
                    {review.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                </div>
              </div>

              <div
                className={styles.rating}
                aria-label={`${review.rating} out of 5 stars`}
              >
                <span aria-hidden="true">★</span>
                <strong>{review.rating}</strong>
                <span className={styles.ratingMaximum}>/ 5</span>
              </div>
            </div>

            <p className={styles.comment}>
              {review.comment?.trim() || (
                <span className={styles.noComment}>No written comment</span>
              )}
            </p>

            <div className={styles.reviewFooter}>
              <div className={styles.reviewer}>
                <span className={styles.reviewerAvatar} aria-hidden="true">
                  {review.reviewerName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div>
                  <strong>{review.reviewerName}</strong>
                  <span>{review.reviewerEmail}</span>
                </div>
              </div>
              <DeleteReviewButton
                reviewId={review.id}
                recipeTitle={review.recipeTitle}
                isPending={isPending}
                disabled={pendingReviewId !== null}
                onConfirm={() => handleDelete(review.id)}
              />
            </div>
          </article>
        );
      })}
    </section>
  );
}
