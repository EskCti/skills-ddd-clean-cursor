import { Id } from '__SHARED_PACKAGE_NAME__';
import { v } from '@/shared/components/form/validator';

export const findUserByIdSchema = v.defineObject({
  id: Id,
});

export type FindUserByIdFormData = v.infer<typeof findUserByIdSchema>;
