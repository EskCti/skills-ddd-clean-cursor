export type ExampleMenuItem = {
  id: "back" | "overview" | "buttons" | "forms" | "tables" | "widgets";
  label: string;
  href: string;
  description: string;
};

export const exampleMenuItems: ExampleMenuItem[] = [
  {
    id: "back",
    label: "Voltar",
    href: "/dashboard",
    description: "Retorna para a tela principal",
  },
  {
    id: "overview",
    label: "Dashboard",
    href: "/example",
    description: "Resumo do módulo Examples",
  },
  {
    id: "buttons",
    label: "Botoes e dialog",
    href: "/example/buttons",
    description: "Variacoes de botoes, dialog e toast",
  },
  {
    id: "forms",
    label: "Formularios",
    href: "/example/forms",
    description: "Campos, combobox, radio, checkbox e tabs",
  },
  {
    id: "tables",
    label: "Tabelas",
    href: "/example/tables",
    description: "Tabela com filtros e navegacao de paginas",
  },
  {
    id: "widgets",
    label: "Widgets",
    href: "/example/widgets",
    description: "Cards operacionais para dashboard",
  },
];
