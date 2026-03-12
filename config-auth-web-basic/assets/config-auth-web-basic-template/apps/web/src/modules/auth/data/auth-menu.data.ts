export type AuthMenuItem = {
  id: "back" | "overview" | "users" | "profile";
  label: string;
  href: string;
  description: string;
};

export const authMenuItems: AuthMenuItem[] = [
  {
    id: "back",
    label: "Voltar",
    href: "/dashboard",
    description: "Retorna para a tela principal",
  },
  {
    id: "overview",
    label: "Auth Dashboard",
    href: "/auth",
    description: "Resumo do módulo Autenticação",
  },
  {
    id: "users",
    label: "Usuários",
    href: "/auth/users",
    description: "Criação, busca e exclusão de usuários",
  },
  {
    id: "profile",
    label: "Perfil",
    href: "/auth/profile",
    description: "Dados do usuário logado e troca de senha",
  },
];
