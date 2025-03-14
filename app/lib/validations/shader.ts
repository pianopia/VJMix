import { z } from 'zod';

export const shaderSchema = z.object({
  title: z.string().min(1, {
    message: 'タイトルは必須です',
  }).max(100, {
    message: 'タイトルは100文字以内で入力してください',
  }),
  description: z.string().max(500, {
    message: '説明は500文字以内で入力してください',
  }).optional(),
  code: z.string().min(1, {
    message: 'コードは必須です',
  }),
  isPublic: z.boolean().default(false),
});

export type ShaderFormValues = z.infer<typeof shaderSchema>; 