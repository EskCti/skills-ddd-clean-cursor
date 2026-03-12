import { Email, PersonName, StrongPassword } from '__SHARED_PACKAGE_NAME__';
import { v } from '@/shared/components/form/validator';

export const registerSchema = v
  .defineObject({
    name: PersonName,
    email: Email,
    password: StrongPassword,
    confirmPassword: StrongPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    field: 'confirmPassword',
    message: 'As senhas nao coincidem.',
  });

export type RegisterFormData = v.infer<typeof registerSchema>;
