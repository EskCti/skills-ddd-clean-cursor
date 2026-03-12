"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/ui/combobox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PageSectionHeader } from "@/shared/components/ui/page-section-header";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";

const teamOptions = [
  { label: "Financeiro", value: "financeiro" },
  { label: "Operações", value: "operacoes" },
  { label: "Suporte", value: "suporte" },
  { label: "Produto", value: "produto" },
];

export function ExampleFormsPage() {
  const [team, setTeam] = useState("financeiro");
  const [channel, setChannel] = useState("email");
  const [sendReport, setSendReport] = useState(true);

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Formulários"
        title="Exemplos de Formulários"
        subtitle="Referência de campos e controles para fluxos de cadastro e preferências."
      />

      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Ex.: Marina Costa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="marina@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label>Equipe</Label>
            <Combobox options={teamOptions} value={team} onChange={setTeam} placeholder="Selecione uma equipe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea id="observacao" placeholder="Descreva contexto adicional..." />
          </div>
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-3">
            <Label>Canal principal</Label>
            <RadioGroup value={channel} onValueChange={setChannel} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="canal-email" value="email" />
                <Label htmlFor="canal-email">Email</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="canal-whatsapp" value="whatsapp" />
                <Label htmlFor="canal-whatsapp">WhatsApp</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="relatorio"
              checked={sendReport}
              onCheckedChange={(checked) => setSendReport(checked === true)}
            />
            <Label htmlFor="relatorio">Receber relatório semanal automático</Label>
          </div>
        </TabsContent>
      </Tabs>

      <Button>Salvar Configurações</Button>
    </div>
  );
}
