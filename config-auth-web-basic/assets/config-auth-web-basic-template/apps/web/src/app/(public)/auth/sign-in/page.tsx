import { SignInPage } from '@/modules/auth';

type SignInRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function sanitizeNextPath(value?: string | string[]): string | undefined {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next) {
    return undefined;
  }

  return next.startsWith('/') ? next : undefined;
}

export default async function SignInRoutePage({ searchParams }: SignInRoutePageProps) {
  const params = await searchParams;
  return <SignInPage nextPath={sanitizeNextPath(params.next)} />;
}
