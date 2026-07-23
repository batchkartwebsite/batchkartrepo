import { z } from "zod";

export const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{8}$/, "PIN must be 8 digits"),
});

export type Creds = z.infer<typeof credsSchema>;
export type Pin = z.infer<typeof pinSchema>;
