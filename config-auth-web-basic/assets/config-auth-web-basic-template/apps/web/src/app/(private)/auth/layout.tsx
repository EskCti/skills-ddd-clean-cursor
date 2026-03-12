import { AdminRoute } from '@/modules/auth';

export default function AuthenticationModuleLayout({ children }: { children: React.ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}
