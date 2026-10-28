"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/recipes/review-actions";
import { useToast } from "@/components/toast-provider";

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
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Your rating</legend>

        <div role="group" aria-label="Choose a rating from 1 to 5 stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
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

        <label htmlFor="review-comment">Your review (optional)</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="How did the recipe turn out?"
        />

        <p>{comment.length}/1000 characters</p>

        <button type="submit">
          {isPending ? "Saving review..." : "Submit review"}
        </button>
      </fieldset>
    </form>
  );
}
