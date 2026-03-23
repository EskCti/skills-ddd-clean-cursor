import { PermissionDTO } from "../dto";
import { CriticalityLevel } from "../model";

const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
} as const;

const SCOPES = {
  OWN: "own",
} as const;

const CONTEXTS = {
  MODULE: "module",
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
} as const;

function permissionAlias(
  domain: string,
  context: string,
  action: string,
  scope?: string,
): string {
  return [domain, context, action, scope].filter(Boolean).join(".");
}

function definePermission(params: {
  id: string;
  name?: string;
  domain: string;
  context: string;
  action: string;
  scope?: string;
  description: string;
  criticality: CriticalityLevel;
}): PermissionDTO {
  const alias = permissionAlias(
    params.domain,
    params.context,
    params.action,
    params.scope,
  );

  return {
    id: params.id,
    name: params.name ?? alias,
    alias,
    description: params.description,
    criticality: params.criticality,
  };
}

export const PERMISSIONS = {
  AUTH: {
    MODULE: {
      VIEW: definePermission({
        id: "09395edc-3951-4357-8527-6f3a5a6a1ce3",
        name: "Acessar módulo de autenticação",
        domain: "auth",
        context: CONTEXTS.MODULE,
        action: ACTIONS.VIEW,
        description: "Permite acessar módulo de autenticação.",
        criticality: CriticalityLevel.LOW,
      }),
    },

    USER: {
      VIEW: definePermission({
        id: "00095edc-3951-4357-8447-6f3a5a6a1ce3",
        name: "Acessar seção de usuários",
        domain: "auth",
        context: CONTEXTS.USER,
        action: ACTIONS.VIEW,
        description:
          "Permite visualizar a seção de usuários no módulo de autenticação.",
        criticality: CriticalityLevel.LOW,
      }),
      READ: definePermission({
        id: "dd239e4b-ce10-4b8f-be7f-93f291320249",
        name: "Visualizar usuários",
        domain: "auth",
        context: CONTEXTS.USER,
        action: ACTIONS.READ,
        description: "Permite visualizar usuários.",
        criticality: CriticalityLevel.LOW,
      }),
      CREATE: definePermission({
        id: "78f53f4c-ed17-42e3-80fd-5066963bea39",
        name: "Criar usuários",
        domain: "auth",
        context: CONTEXTS.USER,
        action: ACTIONS.CREATE,
        description: "Permite criar usuários.",
        criticality: CriticalityLevel.MEDIUM,
      }),
      UPDATE: definePermission({
        id: "bbd9d26e-164c-41da-8f88-849d30445a84",
        name: "Atualizar usuários",
        domain: "auth",
        context: CONTEXTS.USER,
        action: ACTIONS.UPDATE,
        description: "Permite atualizar usuários.",
        criticality: CriticalityLevel.HIGH,
      }),
      DELETE: definePermission({
        id: "4774520e-daca-462c-964f-5256123511e4",
        name: "Excluir usuários",
        domain: "auth",
        context: CONTEXTS.USER,
        action: ACTIONS.DELETE,
        description: "Permite excluir usuários.",
        criticality: CriticalityLevel.CRITICAL,
      }),
    },

    ROLE: {
      VIEW: definePermission({
        id: "00095edc-3951-4357-8527-6f3a5a6a1ce3",
        name: "Acessar seção de perfis",
        domain: "auth",
        context: CONTEXTS.ROLE,
        action: ACTIONS.VIEW,
        description:
          "Permite visualizar a seção de perfis no módulo de autenticação.",
        criticality: CriticalityLevel.LOW,
      }),
      READ: definePermission({
        id: "659543e0-73ae-4c25-9561-e0bf85ecff4d",
        name: "Visualizar perfis",
        domain: "auth",
        context: CONTEXTS.ROLE,
        action: ACTIONS.READ,
        description: "Permite visualizar perfis.",
        criticality: CriticalityLevel.LOW,
      }),
      CREATE: definePermission({
        id: "327d3841-0101-4a01-b92f-0640ff1c0980",
        name: "Criar perfis",
        domain: "auth",
        context: CONTEXTS.ROLE,
        action: ACTIONS.CREATE,
        description: "Permite criar perfis.",
        criticality: CriticalityLevel.HIGH,
      }),
      UPDATE: definePermission({
        id: "087777f0-488f-4a70-a0fe-ec4215836ac4",
        name: "Atualizar perfis",
        domain: "auth",
        context: CONTEXTS.ROLE,
        action: ACTIONS.UPDATE,
        description: "Permite atualizar perfis.",
        criticality: CriticalityLevel.HIGH,
      }),
      DELETE: definePermission({
        id: "b98361ec-fe85-45c3-ac7d-ea299ceb9876",
        name: "Excluir perfis",
        domain: "auth",
        context: CONTEXTS.ROLE,
        action: ACTIONS.DELETE,
        description: "Permite excluir perfis.",
        criticality: CriticalityLevel.CRITICAL,
      }),
    },

    PERMISSION: {
      READ: definePermission({
        id: "59ff5cce-059a-4c7e-8d7a-55488100c44a",
        name: "Visualizar permissões",
        domain: "auth",
        context: CONTEXTS.PERMISSION,
        action: ACTIONS.READ,
        description: "Permite visualizar permissões.",
        criticality: CriticalityLevel.LOW,
      }),
    },
  },

  BASIC: {
    USER: {
      READ_OWN: definePermission({
        id: "814ffc1c-4f1d-49ea-a526-56643947595a",
        name: "Visualizar o próprio usuário",
        domain: "basic",
        context: CONTEXTS.USER,
        action: ACTIONS.READ,
        scope: SCOPES.OWN,
        description: "Permite visualizar o próprio usuário.",
        criticality: CriticalityLevel.LOW,
      }),
      DELETE_OWN: definePermission({
        id: "d83b0a93-ab27-49c6-95bc-afdaa306bbab",
        name: "Deletar o próprio usuário",
        domain: "basic",
        context: CONTEXTS.USER,
        action: ACTIONS.DELETE,
        scope: SCOPES.OWN,
        description: "Permite deletar o próprio usuário.",
        criticality: CriticalityLevel.HIGH,
      }),
      UPDATE_OWN: definePermission({
        id: "45ab02be-8d00-47b9-a16e-df7e8f28caa7",
        name: "Atualizar o próprio usuário",
        domain: "basic",
        context: CONTEXTS.USER,
        action: ACTIONS.UPDATE,
        scope: SCOPES.OWN,
        description: "Permite atualizar o próprio usuário.",
        criticality: CriticalityLevel.MEDIUM,
      }),
    },
  },
} as const;
