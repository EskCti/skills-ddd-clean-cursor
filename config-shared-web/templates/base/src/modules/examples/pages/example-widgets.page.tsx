import { BriefcaseBusiness, Clock3, DollarSign, UserRoundPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, MetricCard, PageSectionHeader, Separator } from '@/shared';

const cards = [
  {
    title: 'Total Revenue',
    value: 'R$ 45.231,89',
    subtitle: (
      <>
        <span className="text-emerald-400">+2,01%</span> from last month
      </>
    ),
    icon: <DollarSign className="size-4" />,
  },
  {
    title: 'Active Projects',
    value: '1.423',
    subtitle: (
      <>
        <span className="text-emerald-400">+5,02%</span> from last month
      </>
    ),
    icon: <BriefcaseBusiness className="size-4" />,
  },
  {
    title: 'New Leads',
    value: '3.500',
    subtitle: (
      <>
        <span className="text-rose-400">-3,58%</span> from last month
      </>
    ),
    icon: <UserRoundPlus className="size-4" />,
  },
  {
    title: 'Time Spent',
    value: '168h 40m',
    subtitle: (
      <>
        <span className="text-rose-400">-3,58%</span> from last month
      </>
    ),
    icon: <Clock3 className="size-4" />,
  },
];

const progress = [
  { label: 'Backoffice', value: 82 },
  { label: 'CRM', value: 63 },
  { label: 'Checkout', value: 91 },
];

export function ExampleWidgetsPage() {
  return (
    <div className="space-y-5">
      <PageSectionHeader
        badge="Widgets"
        title="Blocos para Dashboard"
        subtitle="Componentes visuais prontos para compor painéis com indicadores e progresso."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso por Módulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: item.value + '%' }} />
              </div>
            </div>
          ))}
          <Separator />
          <p className="text-xs text-muted-foreground">Exemplo de widget composto para monitoramento de módulos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
