import { z } from 'zod';

const money = z.preprocess(
  v => (typeof v === 'string' ? v.replace(',', '.') : v),
  z.coerce.number({ invalid_type_error: 'Monto inválido' }).positive('Debe ser mayor a 0').max(10_000_000, 'Monto demasiado alto')
);

export const expenseSchema = z.object({
  amount: money,
  description: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  categoryId: z.string().min(1, 'Elige una categoría'),
  date: z.string().refine(d => !isNaN(Date.parse(d)), 'Fecha inválida'),
});

export const budgetSchema = z.object({
  amount: money,
  categoryId: z.string().min(1, 'Elige una categoría'),
  period: z.enum(['weekly', 'monthly']),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const firstError = (e: unknown) =>
  e instanceof z.ZodError ? e.errors[0].message : e instanceof Error ? e.message : 'Error desconocido';
