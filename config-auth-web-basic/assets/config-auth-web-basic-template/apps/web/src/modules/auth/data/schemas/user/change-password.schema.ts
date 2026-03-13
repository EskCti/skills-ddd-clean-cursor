import { StrongPassword, Text } from '@poupig/shared';
import { v } from '@/shared/components/form/validator';

export const changePasswordSchema = v
  .defineObject({
    oldPassword: { vo: Text, config: { minLength: 1 } },
    newPassword: StrongPassword,
    confirmPassword: StrongPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    field: 'confirmPassword',
    message: 'As senhas nao coincidem.',
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    field: 'newPassword',
    message: 'A nova senha deve ser diferente da senha atual.',
  });

export type ChangePasswordFormData = v.infer<typeof changePasswordSchema>;
