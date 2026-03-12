'use client';

import { AuthProvider } from '@/modules/auth/data';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
