import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\-\s()]{7,15}$/.test(v), "Enter a valid phone number"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters"),
});

export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Forgot = z.infer<typeof forgotSchema>;
export type Reset = z.infer<typeof resetSchema>;
