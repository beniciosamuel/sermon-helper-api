/**
 * User Zod Schemas
 *
 * Centralized validation schemas for user-related procedures.
 * These schemas can be reused across routers and exported for client-side validation.
 */

import { z } from 'zod';

/**
 * Schema for creating a new user
 */
export const createUserInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  color_theme: z.enum(['light', 'dark']).default('light'),
  language: z.enum(['en', 'pt']).default('en'),
});

/**
 * Schema for finding a user by ID
 */
export const findByIdInputSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
});

/**
 * Schema for finding a user by email or phone
 */
export const findByEmailOrPhoneInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
});

/**
 * Schema for updating a user
 */
export const updateUserInputSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  color_theme: z.enum(['light', 'dark']).optional(),
  language: z.enum(['en', 'pt']).optional(),
});

/**
 * Schema for user output (excludes sensitive data)
 */
export const userOutputSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  color_theme: z.string(),
  lang: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Type exports for use in application code
 */
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type FindByIdInput = z.infer<typeof findByIdInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type UserOutput = z.infer<typeof userOutputSchema>;
