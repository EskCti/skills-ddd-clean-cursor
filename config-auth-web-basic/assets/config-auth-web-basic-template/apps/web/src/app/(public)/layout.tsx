'use client';

import { usePathname } from 'next/navigation';
import { PublicBoxedLayout } from '@/shared/template/public-boxed-layout.component';

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/auth' || pathname.startsWith('/auth/');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <PublicBoxedLayout>{children}</PublicBoxedLayout>;
}
