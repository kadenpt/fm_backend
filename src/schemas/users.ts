import { z } from "zod";
import { validPassword } from "../helpers/validPassword";

const passwordSchema = z.string().refine(validPassword, {
  message:
    "Password must be at least 8 characters long and contain at least one special character",
});

export const updateUserBodySchema = z
  .object({
    first_name: z.string().trim().min(1).optional(),
    email: z.string().trim().email("Invalid email").optional(),
    password: passwordSchema.optional(),
  })
  .refine(
    (body) =>
      body.first_name !== undefined ||
      body.email !== undefined ||
      body.password !== undefined,
    { message: "At least one field is required" }
  );

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
