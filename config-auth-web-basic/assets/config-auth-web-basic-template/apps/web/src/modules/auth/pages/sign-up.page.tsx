'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData, useAuth } from '@/modules/auth/data';
import { AuthScreenLayout, PublicOnlyRoute } from '@/modules/auth/components';
import { getErrorMessage } from '@/shared/i18n';
import { v } from '@/shared/components/form/validator';
import { Button, FormErrorMessage, Input, Label } from '@/shared';

export function SignUpPage() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: v.resolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function handleRegister(data: RegisterFormData) {
    try {
      await registerAccount(data);
      toast.success('Cadastro realizado com sucesso.');
      reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      router.push('/auth/sign-in');
    } catch (error) {
      toast.error('Falha ao criar conta.', {
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <PublicOnlyRoute>
      <AuthScreenLayout title="Criar conta" subtitle="Complete os dados para cadastrar um novo usuário.">
        <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" autoComplete="name" {...registerField('name')} />
            {errors.name?.message ? <FormErrorMessage>{errors.name.message}</FormErrorMessage> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...registerField('email')} />
            {errors.email?.message ? <FormErrorMessage>{errors.email.message}</FormErrorMessage> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...registerField('password')} />
            {errors.password?.message ? <FormErrorMessage>{errors.password.message}</FormErrorMessage> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...registerField('confirmPassword')}
            />
            {errors.confirmPassword?.message ? (
              <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </AuthScreenLayout>
    </PublicOnlyRoute>
  );
}
