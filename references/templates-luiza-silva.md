# Biblioteca de Templates de Análise de Requisitos (Baseado em Luiza Silva)

Use estes templates como estrutura de saída quando o skill gerar documentação. Adapte os campos conforme a criticidade do projeto.

## T01: Roteiro de Entrevista com Stakeholders
**Uso:** Antes/durante entrevistas para revelar contexto, dores, regras e expectativas.
- **Projeto/Iniciativa:** [Nome e breve contexto]
- **Stakeholder:** [Nome, papel, área e relação com o proceso]
- **Objetivo da conversa:** [O que precisa ser entendido, validado ou decidido]
- **Processo atual:** [Como a atividade é executada hoje, do início ao fim]
- **Problemas e dores:** [Gargalos, retrabalho, demora, erros, controles manuais]
- **Regras de negócio:** [Condições, limites, aprovações, políticas e cálculos]
- **Exceções:** [Situações fora do fluxo normal e como são tratadas]
- **Dados e documentos:** [Entradas, saídas, campos obrigatórios, anexos]
- **Sistemas e integrações:** [Ferramentas utilizadas e dependências externas]
- **Dúvidas/Pendências:** [Pontos sem resposta ou que exigem validação]
- **Próximas ações:** [Responsável e próximo passo para cada pendência]

## T02: Ata de Reunião de Levantamento
**Uso:** Logo após reuniões para criar memória objetiva e reduzir interpretações divergentes.
- **Data/Horário:** [Quando ocorreu]
- **Participantes:** [Nome e área]
- **Objetivo:** [Motivo da reunião]
- **Contexto:** [Resumo do cenário discutido]
- **Requisitos identificados:** [IDs ou descrições preliminares]
- **Regras de negócio:** [Regras mencionadas ou confirmadas]
- **Decisões:** [O que ficou efetivamente decidido]
- **Dúvidas:** [Pontos ainda sem resposta]
- **Pendências:** [Ações necessárias com Responsável e Prazo]
- **Próxima reunião/marco:** [Data ou condição para continuidade]

## T03: Ficha Individual de Requisito
**Uso:** Para requisitos complexos ou críticos que precisam ser rastreáveis e testáveis.
- **ID:** [Ex: REQ-014]
- **Título:** [Nome curto e específico]
- **Tipo:** [Negócio / Funcional / Não Funcional]
- **Origem:** [Stakeholder, política, processo ou documento]
- **Necessidade:** [Problema ou objetivo que justifica o requisito]
- **Descrição:** [Comportamento, capacidade ou condição esperada]
- **Regras relacionadas:** [IDs das regras de negócio]
- **Critérios de aceite:** [Condições objetivas para considerar o requisito atendido]
- **Dependências:** [Requisitos, decisões, sistemas ou integrações]
- **Prioridade:** [MoSCoW ou critério adotado]
- **Responsável pela validação:** [Pessoa ou área]

## T04: User Story e Critérios de Aceite
**Uso:** Para times ágeis, expressando necessidade em linguagem orientada a valor.
- **Épico/Tema:** [Contexto maior]
- **Perfil (Persona):** [Quem recebe valor]
- **User Story:** Como [perfil], quero [necessidade], para que [benefício].
- **Contexto adicional:** [Informações que ajudam a compreender]
- **Regras relacionadas:** [IDs de regras de negócio]
- **Critérios de Aceite (Given/When/Then):**
  - Dado que [contexto/pré-condição]
  - Quando [ação/evento]
  - Então [resultado esperado]
- **Cenários de exceção:** [Erros, limites ou comportamentos alternativos]
- **Dependências:** [Itens necessários para implementação]

## T05: Registro de Regra de Negócio
**Uso:** Documentar políticas, condições, limites ou cálculos de forma independente dos requisitos.
- **ID da Regra:** [Ex: RN-003]
- **Nome:** [Título curto]
- **Descrição:** [Condição ou obrigação de negócio]
- **Origem:** [Política, norma, área ou stakeholder]
- **Aplicação:** [Quando e onde a regra deve ser aplicada]
- **Exceções:** [Casos em que a regra não se aplica]
- **Requisitos relacionados:** [IDs impactados]
- **Validador:** [Área ou pessoa com autoridade sobre a regra]
- **Status/Vigência:** [Ativa, proposta, substituída]

## T06: Registro de Decisões
**Uso:** Sempre que uma reunião ou análise resultar em escolha que afete escopo, requisito ou solução.
- **ID:** [Ex: DEC-001]
- **Data:** [Quando a decisão foi tomada]
- **Tema:** [Assunto decidido]
- **Contexto:** [Problema ou alternativas consideradas]
- **Decisão:** [O que foi escolhido]
- **Motivação:** [Por que foi escolhido]
- **Participantes/Aprovadores:** [Quem participou ou aprovou]
- **Impactos:** [Requisitos, regras, prazo, testes ou sistemas afetados]
- **Ações decorrentes:** [O que precisa ser feito após a decisão]

## T07: Registro de Dúvidas e Pendências
**Uso:** Durante todo o ciclo, para controlar itens que impedem confirmação ou avanço.
- **ID:** [Ex: PEND-001]
- **Descrição:** [Dúvida, validação ou ação necessária]
- **Tipo:** [Dúvida / Validação / Ação / Dependência]
- **Origem:** [Reunião, requisito ou análise]
- **Impacto se não resolver:** [Baixo / Médio / Alto / Crítico + justificativa]
- **Responsável:** [Pessoa ou área que deve agir]
- **Prazo/Marco:** [Quando deve ser resolvido]
- **Status:** [Aberta / Em andamento / Resolvida / Cancelada]
- **Resposta/Evidência:** [Conclusão ou referência que encerra a pendência]

## T08: Solicitação de Mudança de Requisito
**Uso:** Quando um requisito aprovado ou em andamento precisa ser alterado, removido ou ampliado.
- **ID da Mudança:** [Ex: MUD-001]
- **Solicitante:** [Nome e área]
- **Data:** [Data da solicitação]
- **Descrição da mudança:** [O que deve ser alterado]
- **Justificativa:** [Por que a mudança é necessária]
- **Requisitos/Regras impactados:** [IDs relacionados]
- **Impacto preliminar:** [Escopo, solução, testes, prazo, custo, risco]
- **Alternativas:** [Opções consideradas, quando aplicável]
- **Recomendação:** [Parecer da análise]
- **Decisão:** [Aprovada / Rejeitada / Adiada]
- **Aprovadores:** [Quem decide]

## T09: Análise de Impacto
**Uso:** Antes de aprovar uma mudança, novo requisito relevante ou alteração de regra.
- **Mudança/Requisito:** [Descrição do item analisado]
- **Processos impactados:** [Etapas de negócio afetadas]
- **Requisitos e regras:** [IDs relacionados]
- **Sistemas/Integrações:** [Componentes impactados]
- **Dados:** [Campos, cadastros, históricos ou migrações]
- **Segurança/Conformidade:** [Permissões, auditoria, privacidade, normas]
- **Testes:** [Novos cenários ou regressões]
- **Prazo/Esforço:** [Impacto estimado]
- **Riscos:** [Riscos introduzidos ou ampliados]
- **Recomendação:** [Prosseguir, ajustar, adiar ou rejeitar]

## T10: Termo de Validação de Requisitos
**Uso:** Ao final de uma etapa de análise, antes de desenvolvimento, para registrar concordância formal.
- **Projeto/Versão:** [Nome e versão do conjunto de requisitos]
- **Escopo validado:** [Itens incluídos na validação]
- **Stakeholders revisores:** [Pessoas e áreas participantes]
- **Itens aprovados:** [IDs aprovados]
- **Itens com ressalva:** [IDs + condição ou pendência]
- **Itens pendentes:** [O que ainda não pode ser validado]
- **Decisões associadas:** [IDs de decisões relevantes]
- **Riscos conhecidos:** [Riscos aceitos ou em tratamento]
- **Próximos passos:** [Ações após a validação]
- **Data da validação:** [Data do registro]

## T11: Checklist de Prontidão para Desenvolvimento (DoR)
**Uso:** Antes de considerar um requisito ou user story pronto para implementação.
- **Requisito/Story:** [ID do item]
- [ ] Necessidade compreendida? (Sim/Não/Parcial)
- [ ] Descrição clara e sem termos vagos? (Sim/Não)
- [ ] Critérios de aceite definidos? (Sim/Não)
- [ ] Regras relacionadas confirmadas? (Sim/Não/N/A)
- [ ] Dependências mapeadas? (Sim/Não)
- [ ] Dúvidas críticas resolvidas? (Sim/Não)
- [ ] Viabilidade técnica conhecida? (Sim/Não/N/A)
- [ ] Dados/Integrações definidos? (Sim/Não/N/A)
- [ ] Prioridade confirmada? (Sim/Não)
- [ ] Validador identificado? (Sim/Não)
- **Resultado:** [PRONTO PARA DESENVOLVIMENTO | NÃO PRONTO (Motivo: ______)]

## T12: Registro de Lições Aprendidas
**Uso:** Ao final de uma fase, release ou projeto, para transformar experiência em melhorias.
- **Contexto:** [Projeto, fase ou período]
- **O que funcionou:** [Práticas que ajudaram]
- **O que não funcionou:** [Problemas observados]
- **Causa percebida:** [Por que ocorreu]
- **Impacto:** [Consequência no projeto]
- **Aprendizado:** [O que deve ser mantido ou mudado]
- **Ação de melhoria:** [Ação específica para o próximo ciclo]
- **Responsável:** [Quem implementará a melhoria]
- **Evidência de sucesso:** [Como saberemos que melhorou]
