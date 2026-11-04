"use client";

import { useState } from "react";

import styles from "./review-list.module.scss";

type DeleteReviewButtonProps = {
  reviewId: number;
  recipeTitle: string;
  isPending: boolean;
  disabled: boolean;
  onConfirm: () => void;
};

export default function DeleteReviewButton({
  reviewId,
  recipeTitle,
  isPending,
  disabled,
  onConfirm,
}: DeleteReviewButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleConfirm() {
    setShowConfirmation(false);
    onConfirm();
  }

  return (
    <>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => setShowConfirmation(true)}
        disabled={disabled}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          focusable="false"
        >
          <path
            d="M3.5 4.5h9m-8 0 .5 8h6l.5-8M6.25 4.5V3h3.5v1.5m-2.75 2v4m2-4v4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
        </svg>
        Delete
      </button>

      {showConfirmation && (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-review-title-${reviewId}`}
            aria-describedby={`delete-review-description-${reviewId}`}
          >
            <span className={styles.dialogIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false">
                <path
                  d="M4.5 7h15m-13.5 0 .8 13h10.4L18 7M9 7V4.5h6V7m-4.5 3v6m3-6v6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <p className={styles.dialogEyebrow}>REMOVE REVIEW</p>
            <h2 id={`delete-review-title-${reviewId}`}>Delete this review?</h2>
            <p id={`delete-review-description-${reviewId}`}>
              This review for <strong>{recipeTitle}</strong> will be permanently
              removed. This action cannot be undone.
            </p>
            <p className={styles.dialogNotice}>
              <span aria-hidden="true">!</span> This action is permanent
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
              >
                Keep review
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
