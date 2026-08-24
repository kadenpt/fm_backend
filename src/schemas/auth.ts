import { z } from "zod";
import { validPassword } from "../helpers/validPassword";

const passwordSchema = z.string().refine(validPassword, {
  message:
    "Password must be at least 8 characters long and contain at least one special character",
});

export const signupBodySchema = z.object({
  first_name: z.string().trim().min(1, "first_name is required"),
  email: z.string().trim().email("Invalid email"),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "password is required"),
});

export const verifyOtpBodySchema = z.object({
  email: z.string().trim().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "code must be a 6-digit number"),
});

export const resendOtpBodySchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;
export type ResendOtpBody = z.infer<typeof resendOtpBodySchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;
