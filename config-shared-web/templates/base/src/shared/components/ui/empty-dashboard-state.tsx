import Image from 'next/image';

type EmptyDashboardStateProps = {
  moduleName?: string;
};

export function EmptyDashboardState({ moduleName }: EmptyDashboardStateProps) {
  const normalizedModuleName = moduleName?.trim();
  const hasModuleName = Boolean(normalizedModuleName);

  return (
    <section className="flex min-h-[calc(100vh-9rem)] w-full items-center justify-center">
      <article className="w-full max-w-5xl bg-transparent p-2 md:p-4">
        <div className="mb-3 text-center md:mb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-100 md:text-4xl">
            Dashboard{' '}
            {hasModuleName ? (
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                {normalizedModuleName}
              </span>
            ) : (
              'Vazio'
            )}
          </h1>
          <p className="text-sm text-slate-400 md:text-base">
            Esta area esta pronta para receber os widgets e indicadores da aplicacao.
          </p>
        </div>

        <div className="mx-auto w-full max-w-270">
          <Image
            src="/illustrations/empty-dashboard-dark.svg"
            alt="Ilustracao de dashboard vazio aguardando implementacao"
            width={1600}
            height={1000}
            priority
            className="mx-auto h-auto max-h-[56vh] w-full object-contain"
          />
        </div>
      </article>
    </section>
  );
}
