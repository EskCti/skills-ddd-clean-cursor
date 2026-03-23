'use client';

import { ShellProvider } from '@/shared/context/shell.context';

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  return <ShellProvider defaultOpen>{children}</ShellProvider>;
}
