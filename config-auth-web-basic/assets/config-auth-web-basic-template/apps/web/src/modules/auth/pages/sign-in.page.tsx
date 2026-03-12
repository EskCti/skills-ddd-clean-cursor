'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth, loginSchema, type LoginFormData } from '@/modules/auth/data';
import { AuthScreenLayout, PublicOnlyRoute } from '@/modules/auth/components';
import { getErrorMessage } from '@/shared/i18n';
import { v } from '@/shared/components/form/validator';
import { Button, FormErrorMessage, Input, Label } from '@/shared';

type SignInPageProps = {
  nextPath?: string;
};

export function SignInPage({ nextPath }: SignInPageProps) {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: v.resolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleLogin(data: LoginFormData) {
    try {
      await login(data);
      router.replace(nextPath || '/dashboard');
    } catch (error) {
      toast.error('Falha ao entrar.', {
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <PublicOnlyRoute>
      <AuthScreenLayout title="Entrar na plataforma" subtitle="Use seu e-mail e senha para acessar a área privada.">
        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...registerField('email')} />
            {errors.email?.message ? <FormErrorMessage>{errors.email.message}</FormErrorMessage> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" {...registerField('password')} />
            {errors.password?.message ? <FormErrorMessage>{errors.password.message}</FormErrorMessage> : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </AuthScreenLayout>
    </PublicOnlyRoute>
  );
}
