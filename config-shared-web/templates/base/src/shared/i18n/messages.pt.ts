export const errorMessagesPt = {
    REQUIRED_FIELD: "Campo de preenchimento obrigatório.",
    INVALID_VALUE: "Valor inválido.",
    INVALID_ARRAY: "O valor deve ser uma lista.",
    INVALID_OBJECT: "O valor deve ser um objeto.",
    INVALID_ITEM: "Item inválido.",
    MIN_ITEMS: "Mínimo de {{min}} itens.",
    MAX_ITEMS: "Máximo de {{max}} itens.",
    USER_NOT_FOUND: "Usuário não encontrado.",
    USER_EMAIL_ALREADY_EXISTS: "Já existe um usuário com este e-mail.",
    USER_INVALID_CREDENTIALS:
        "Credenciais inválidas. Verifique seu e-mail e senha.",
    USER_UNAUTHORIZED: "Não autorizado. Faça login novamente.",
    USER_ACCESS_DENIED:
        "Acesso negado. Você não tem permissão para realizar esta ação.",
    PASSWORD_MISMATCH: "Usuário ou senha incorretos.",
    WEAK_PASSWORD: "A senha é muito fraca.",
    PASSWORD_REUSED_RECENT_PASSWORD:
        "A nova senha não pode ser igual a uma senha usada recentemente.",
    NOT_FOUND: "Registro não encontrado.",
    INVALID_ID: "ID inválido. Verifique os dados e tente novamente.",
    MUST_HAVE_FIRST_AND_LAST_NAME: "Informe nome e sobrenome.",
    USER_UPDATE_EMPTY_PAYLOAD:
        "Informe ao menos nome ou e-mail para atualizar o usuário.",
    AUTH_FIND_ALL_USERS_ERROR:
        "Não foi possível carregar a lista de usuários no momento.",
    SHELL_CONTEXT_PROVIDER_REQUIRED:
        "useShellContext deve ser usado dentro de <ShellProvider>.",
    UNKNOWN_ERROR_CODE: "Erro desconhecido: {{code}}",
    DEFAULT_API_ERROR:
        "Ocorreu um erro inesperado na comunicação com o servidor.",
} as const;

export type ErrorMessageKey = keyof typeof errorMessagesPt;
export type ErrorMessages = Record<ErrorMessageKey, string>;
