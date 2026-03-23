'use client';

import { PrivateRoute } from '@/modules/auth';
import { ShellProvider } from '@/shared/context/shell.context';

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider defaultOpen>
      <PrivateRoute>{children}</PrivateRoute>
    </ShellProvider>
  );
}
