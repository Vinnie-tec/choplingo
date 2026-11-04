import { z } from "zod";

export const recipeStatusSchema = z.object({
  recipeId: z.number().int().positive(),
  status: z.enum(["draft", "published"]),
});