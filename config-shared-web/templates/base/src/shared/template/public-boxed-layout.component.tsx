type PublicBoxedLayoutProps = {
  children: React.ReactNode;
};

export function PublicBoxedLayout({ children }: PublicBoxedLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:py-8">
        {children}
      </div>
    </main>
  );
}
