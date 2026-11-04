import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingredient name must be at least 2 characters.")
    .max(100, "Ingredient name cannot exceed 100 characters."),
});

export const updateIngredientSchema = createIngredientSchema.extend({
  ingredientId: z.number().int().positive(),
});

export type CreateIngredientInput = z.infer<
  typeof createIngredientSchema
>;

export type UpdateIngredientInput = z.infer<
  typeof updateIngredientSchema
>;