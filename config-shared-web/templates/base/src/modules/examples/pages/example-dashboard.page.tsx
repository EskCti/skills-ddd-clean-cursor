import { Blend, LayoutGrid, Rows3, SquareMousePointer } from 'lucide-react';
import { NavigationLinkCard, PageSectionHeader } from '@/shared';

const blocks = [
  {
    title: 'Formulários',
    description: 'Campos de texto, combobox, radio, checkbox e tabs.',
    href: '/example/forms',
    icon: <SquareMousePointer className="size-6" />,
  },
  {
    title: 'Botões e Diálogo',
    description: 'Botões em variações, modal de diálogo e toasts.',
    href: '/example/buttons',
    icon: <Blend className="size-6" />,
  },
  {
    title: 'Tabelas',
    description: 'Tabela com filtros e navegação de páginas.',
    href: '/example/tables',
    icon: <Rows3 className="size-6" />,
  },
  {
    title: 'Widgets',
    description: 'Cards e indicadores para painéis de monitoramento.',
    href: '/example/widgets',
    icon: <LayoutGrid className="size-6" />,
  },
];

export function ExampleDashboardPage() {
  return (
    <div className="space-y-4">
      <PageSectionHeader
        badge="Visão Geral"
        title="Módulo de Exemplos"
        subtitle="Use este módulo para acelerar novas telas e manter padrões visuais consistentes."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {blocks.map((block) => (
          <NavigationLinkCard
            key={block.title}
            href={block.href}
            icon={block.icon}
            title={block.title}
            description={block.description}
          />
        ))}
      </div>
    </div>
  );
}
