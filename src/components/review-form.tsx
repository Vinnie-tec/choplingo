"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/recipes/review-actions";
import { useToast } from "@/components/toast-provider";

import styles from "./review-form.module.scss";

type ReviewFormProps = {
  recipeId: number;
  initialRating?: number;
  initialComment?: string;
};

export default function ReviewForm({
  recipeId,
  initialRating = 0,
  initialComment = "",
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      showToast("Please select a rating from 1 to 5 stars.", "error");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        recipeId,
        rating,
        comment,
      });

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast(result.message, "success");
      setRating(0);
      setComment("");
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.fieldset} disabled={isPending}>
        <legend className={styles.legend}>Your rating</legend>

        <div
          className={styles.rating}
          role="group"
          aria-label="Choose a rating from 1 to 5 stars"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className={styles.star}
              key={star}
              type="button"
              aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
            >
              {star <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>

        <label className={styles.label} htmlFor="review-comment">
          Your review (optional)
        </label>
        <textarea
          className={styles.comment}
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="How did the recipe turn out?"
        />

        <p className={styles.characterCount}>{comment.length}/1000 characters</p>

        <button className={styles.submitButton} type="submit">
          {isPending ? "Saving review..." : "Submit review"}
        </button>
      </fieldset>
    </form>
  );
}
