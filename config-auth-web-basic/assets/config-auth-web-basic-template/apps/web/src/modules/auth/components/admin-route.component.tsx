'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/data';

type AdminRouteProps = {
  children: React.ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/auth/sign-in?next=${nextPath}`);
      return;
    }

    if (!user?.admin) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.admin]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Validando acesso administrativo...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.admin) {
    return null;
  }

  return <>{children}</>;
}
