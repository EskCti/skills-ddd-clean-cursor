import { Id } from '@poupig/shared';
import { v } from '@/shared/components/form/validator';

export const findUserByIdSchema = v.defineObject({
  id: Id,
});

export type FindUserByIdFormData = v.infer<typeof findUserByIdSchema>;
