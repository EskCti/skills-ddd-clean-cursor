'use client';

import type { ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/data';
import { AppShell } from '@/shared/template/app-shell.component';

export type PrivateAppShellProps = ComponentProps<typeof AppShell>;

export function PrivateAppShell({
  userName,
  userEmail,
  userAvatarUrl,
  profileHref = '/auth/profile',
  onLogout,
  ...props
}: PrivateAppShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleDefaultLogout = () => {
    logout();
    router.replace('/auth/sign-in');
  };

  return (
    <AppShell
      {...props}
      userName={userName ?? user?.name ?? 'Usuario'}
      userEmail={userEmail ?? user?.email ?? 'usuario@aplicacao.local'}
      userAvatarUrl={userAvatarUrl ?? user?.avatarUrl ?? null}
      profileHref={profileHref}
      onLogout={onLogout ?? handleDefaultLogout}
    />
  );
}
