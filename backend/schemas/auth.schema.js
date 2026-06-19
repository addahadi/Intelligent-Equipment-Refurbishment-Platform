import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    nom: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    telephone: z.string().trim().optional(),
    adresse: z.string().trim().optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
};
