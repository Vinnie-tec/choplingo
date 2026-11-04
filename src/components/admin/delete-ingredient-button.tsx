"use client";

import { useState } from "react";

import styles from "./ingredient-list.module.scss";

type DeleteIngredientButtonProps = {
  ingredientId: number;
  ingredientName: string;
  isPending: boolean;
  disabled: boolean;
  isUsed: boolean;
  onConfirm: () => void;
};

export default function DeleteIngredientButton({
  ingredientId,
  ingredientName,
  isPending,
  disabled,
  isUsed,
  onConfirm,
}: DeleteIngredientButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleConfirm() {
    setShowConfirmation(false);
    onConfirm();
  }

  return (
    <>
      <button
        className={`${styles.deleteButton} ${isUsed ? styles.disabledDelete : ""}`}
        type="button"
        onClick={() => setShowConfirmation(true)}
        disabled={disabled || isUsed}
        title={isUsed ? "Remove this ingredient from its recipes first" : undefined}
      >
        {isUsed ? "In use" : "Delete"}
      </button>

      {showConfirmation && (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-ingredient-title-${ingredientId}`}
            aria-describedby={`delete-ingredient-description-${ingredientId}`}
          >
            <span className={styles.dialogIcon} aria-hidden="true">!</span>
            <p className={styles.dialogEyebrow}>REMOVE INGREDIENT</p>
            <h2 id={`delete-ingredient-title-${ingredientId}`}>
              Delete {ingredientName}?
            </h2>
            <p id={`delete-ingredient-description-${ingredientId}`}>
              This removes the unused ingredient from your shared library.
              This action cannot be undone.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
              >
                Keep ingredient
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete ingredient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
