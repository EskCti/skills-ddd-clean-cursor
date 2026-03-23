import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 backdrop-blur">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-sm font-medium">Application</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/example"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium"
          >
            Ver exemplos
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Abrir dashboard
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center py-8 sm:py-12">
        <div className="w-full space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Starter Kit</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Estrutura moderna para lancar dashboards com consistencia e velocidade.
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              Base pronta com shell privado/publico, modulo de exemplos e componentes reutilizaveis para evoluir seu
              produto com mais clareza.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
