import Link from 'next/link';

export default function PublicLandingPage() {
  return (
    <section className="space-y-6 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Area publica</h1>
        <p className="text-sm text-muted-foreground">
          Layout boxed ideal para autenticacao, onboarding e landing pages.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 text-left">
        <h2 className="text-base font-medium">Exemplo de bloco de autenticacao</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Este espaco pode ser substituido por login, cadastro ou recuperacao de senha.
        </p>
        <div className="mt-4">
          <Link href="/dashboard" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Continuar para dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
