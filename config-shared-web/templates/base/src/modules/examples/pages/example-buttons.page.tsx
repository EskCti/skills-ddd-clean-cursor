'use client';

import { toast } from 'sonner';
import { Button, PageSectionHeader, StandardDialogContent } from '@/shared';
import { Dialog, DialogTrigger } from '@/shared/components/ui/dialog';

export function ExampleButtonsPage() {
  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Botões"
        title="Botões, Diálogo e Mensagens"
        subtitle="Demonstra variações de botões, confirmações em diálogo e notificações por toast."
      />

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Variações de Botões</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Diálogo de Confirmação</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir Diálogo</Button>
          </DialogTrigger>
          <StandardDialogContent
            title="Confirmar Publicação"
            description="Esta ação publica o conteúdo no ambiente principal."
            footer={
              <>
                <Button variant="secondary">Cancelar</Button>
                <Button>Confirmar</Button>
              </>
            }
          />
        </Dialog>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Mensagens (toast)</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-500"
            onClick={() =>
              toast.info('Atualização disponível', {
                description: 'Nova versão pronta para sincronizar.',
              })
            }
          >
            Toast Info
          </Button>

          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={() =>
              toast.success('Operação concluída', {
                description: 'Registro salvo com sucesso.',
              })
            }
          >
            Toast Sucesso
          </Button>

          <Button
            className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
            onClick={() =>
              toast.warning('Atenção ao revisar', {
                description: 'Há campos opcionais sem preenchimento.',
              })
            }
          >
            Toast Advertência
          </Button>

          <Button
            className="bg-red-600 text-white hover:bg-red-500"
            onClick={() =>
              toast.error('Falha ao concluir', {
                description: 'Não foi possível finalizar a requisição.',
              })
            }
          >
            Toast Erro
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast('Mensagem padrão', {
                description: 'Exemplo de notificação neutra.',
              })
            }
          >
            Toast Padrão
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              toast.promise(
                new Promise((resolve) => {
                  setTimeout(() => resolve('ok'), 1200);
                }),
                {
                  loading: 'Processando ação...',
                  success: 'Processamento concluído.',
                  error: 'Não foi possível concluir o processamento.',
                },
              )
            }
          >
            Toast Promise
          </Button>
        </div>
      </section>
    </div>
  );
}
