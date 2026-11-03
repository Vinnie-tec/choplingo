
import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z.string().trim().min(3).max(180),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  description: z.string().trim().min(10),

  categoryId: z.number().int().positive(),

  preparationMinutes: z.number().int().positive(),

  cookingMinutes: z.number().int().positive(),

  servings: z.number().int().positive().max(100),

  difficulty: z.enum(["easy", "medium", "hard"]),

  imageUrl: z.string().url().optional().or(z.literal("")),

  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        quantity: z.number().positive(),
        unit: z.string().trim().min(1).max(40),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1),

  instructions: z
    .array(
      z.object({
        step: z.number().int().positive(),
        instruction: z.string().trim().min(5),
      })
    )
    .min(1),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
