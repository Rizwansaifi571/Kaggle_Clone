import { z } from 'zod';

export const passwordSchema = z.string()
  .min(10, 'Password must be at least 10 characters long')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});
