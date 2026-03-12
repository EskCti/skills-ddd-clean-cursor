import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Poupig Dashboard Starter</h1>
          <p className="max-w-3xl text-muted-foreground">
            Estrutura inicial preparada com shell administrativo, modulo de exemplos e componentes base para uma aplicacao dashboard.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-medium">Dashboard principal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesso ao shell privado com visao geral da aplicacao.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Abrir dashboard
            </Link>
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-medium">Modulo Examples</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Catalogo com exemplos de formularios, botoes, tabelas, navegacao e widgets.
            </p>
            <Link
              href="/example"
              className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              Abrir exemplos
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}
