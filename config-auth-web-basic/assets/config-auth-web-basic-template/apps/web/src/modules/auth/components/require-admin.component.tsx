'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/data';

type RequireAdminProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequireAdmin({ children, fallback = null }: RequireAdminProps) {
  const { user } = useAuth();

  if (!user?.admin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
