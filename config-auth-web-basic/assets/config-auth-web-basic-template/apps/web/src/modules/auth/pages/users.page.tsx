"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { UserDTO } from "__AUTH_PACKAGE_NAME__";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/i18n";
import { v } from "@/shared/components/form/validator";
import {
  Button,
  DeleteConfirmationDialog,
  Dialog,
  DialogContent,
  DialogTitle,
  FormErrorMessage,
  PageSectionHeader,
  PaginationControls,
  StandardDialogContent,
  TableCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormData,
  type EditUserFormData,
  useAuth,
} from "@/modules/auth/data";
import { UserDetailsCard } from "@/modules/auth/components/user-details-card.component";
import { UserFormFields } from "@/modules/auth/components/user-form-fields.component";
import { UserAdminIndicator } from "@/modules/auth/components/user-admin-indicator.component";
import Image from "next/image";

const PAGE_SIZE = 10;

const EMPTY_CREATE_FORM: CreateUserFormData = {
  name: "",
  email: "",
  password: "",
  avatarUrl: "",
};

type UserTableAvatarProps = {
  name: string;
  avatarUrl?: string | null;
};

function UserTableAvatar({ name, avatarUrl }: UserTableAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const resolvedAvatarUrl =
    avatarUrl && failedAvatarUrl !== avatarUrl ? avatarUrl : null;

  if (resolvedAvatarUrl) {
    return (
      <Image
        src={resolvedAvatarUrl}
        alt={`Avatar de ${name}`}
        className="size-8 shrink-0 rounded-full border border-border object-cover"
        onError={() => setFailedAvatarUrl(avatarUrl ?? null)}
        width={32}
        height={32}
      />
    );
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
      <UserRound className="size-4" />
    </span>
  );
}

export function UsersPage() {
  const { createUser, deleteUser, getUsers, updateUser, user } = useAuth();

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatePasswordVisible, setIsCreatePasswordVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserDTO | null>(null);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null);

  const {
    register: registerCreate,
    handleSubmit: submitCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreate,
    watch: watchCreate,
    setValue: setCreateValue,
  } = useForm<CreateUserFormData>({
    resolver: v.resolver(createUserSchema),
    defaultValues: EMPTY_CREATE_FORM,
  });

  const {
    register: registerEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors, isSubmitting: isUpdating },
    reset: resetEdit,
    watch: watchEdit,
    setValue: setEditValue,
  } = useForm<EditUserFormData>({
    resolver: v.resolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      avatarUrl: "",
    },
  });

  const createAvatarUrl = watchCreate("avatarUrl") ?? "";
  const editAvatarUrl = watchEdit("avatarUrl") ?? "";

  const refreshUsers = useCallback(
    async (targetPage: number) => {
      setListError(null);
      setIsLoadingUsers(true);

      try {
        const response = await getUsers({
          page: targetPage,
          pageSize: PAGE_SIZE,
        });

        setUsers(response.data);
        setTotalPages(response.meta.totalPages);
        setPage(response.meta.page);
      } catch (error) {
        setListError(getErrorMessage(error));
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [getUsers],
  );

  useEffect(() => {
    void refreshUsers(page);
  }, [page, refreshUsers]);

  useEffect(() => {
    if (!editingUser) {
      return;
    }

    resetEdit({
      name: editingUser.name,
      email: editingUser.email,
      avatarUrl: editingUser.avatarUrl ?? "",
    });
  }, [editingUser, resetEdit]);

  const canDeleteSelectedUser = useMemo(
    () => Boolean(deletingUser?.id) && deletingUser?.id !== user?.id,
    [deletingUser?.id, user?.id],
  );

  const safeTotalPages = Math.max(1, totalPages);

  function onChangePage(nextPage: number) {
    const safePage = Math.min(Math.max(1, Math.floor(nextPage)), safeTotalPages);
    if (safePage !== page) {
      setPage(safePage);
    }
  }

  async function onCreateUser(data: CreateUserFormData) {
    try {
      await createUser(data);
      toast.success("Usuário criado com sucesso.");
      setIsCreateDialogOpen(false);
      resetCreate(EMPTY_CREATE_FORM);

      if (page !== 1) {
        setPage(1);
      } else {
        await refreshUsers(1);
      }
    } catch (error) {
      toast.error("Falha ao criar usuário.", {
        description: getErrorMessage(error),
      });
    }
  }

  async function onUpdateUser(data: EditUserFormData) {
    if (!editingUser?.id) {
      return;
    }

    try {
      await updateUser(editingUser.id, {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
      });

      toast.success("Usuário atualizado com sucesso.");
      setEditingUser(null);
      await refreshUsers(page);
    } catch (error) {
      toast.error("Falha ao atualizar usuário.", {
        description: getErrorMessage(error),
      });
    }
  }

  async function onDeleteUser() {
    if (!deletingUser?.id || !canDeleteSelectedUser) {
      return;
    }

    try {
      await deleteUser(deletingUser.id);
      toast.success("Usuário excluído com sucesso.");
      setDeletingUser(null);
      await refreshUsers(page);
    } catch (error) {
      toast.error("Falha ao excluir usuário.", {
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Usuários"
        title="Gestão de Usuários"
        subtitle="Cadastre, altere e exclua usuários com paginação na listagem."
        aside={
          <Button
            type="button"
            onClick={() => {
              resetCreate(EMPTY_CREATE_FORM);
              setIsCreatePasswordVisible(false);
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo Usuário
          </Button>
        }
      />

      <TableCard
        footer={
          listError ? (
            <FormErrorMessage size="sm">{listError}</FormErrorMessage>
          ) : (
            <PaginationControls
              page={page}
              totalPages={safeTotalPages}
              onPageChange={onChangePage}
              disabled={isLoadingUsers}
              siblingCount={1}
              showSummary={false}
            />
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 md:px-6">Nome</TableHead>
              <TableHead className="hidden px-5 md:table-cell md:px-6">E-mail</TableHead>
              <TableHead className="hidden px-5 xl:table-cell md:px-6">ID</TableHead>
              <TableHead className="w-45 px-5 text-right md:px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((tableUser) => (
                <TableRow
                  key={tableUser.id}
                  className="cursor-pointer"
                  onClick={() => setViewingUser(tableUser)}
                >
                  <TableCell className="px-5 font-medium md:px-6">
                    <div className="flex items-center gap-3">
                      <UserTableAvatar
                        name={tableUser.name}
                        avatarUrl={tableUser.avatarUrl}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="block min-w-0 truncate">{tableUser.name}</span>
                          {tableUser.admin ? <UserAdminIndicator admin /> : null}
                        </div>
                        <span className="block truncate text-xs font-normal text-muted-foreground md:hidden">
                          {tableUser.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-5 md:table-cell md:px-6">
                    {tableUser.email}
                  </TableCell>
                  <TableCell className="hidden max-w-70 truncate px-5 text-xs text-muted-foreground xl:table-cell md:px-6">
                    {tableUser.id}
                  </TableCell>
                  <TableCell className="px-5 md:px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-yellow-400/90 text-yellow-300 hover:border-yellow-300 hover:bg-yellow-400/15 hover:text-yellow-200"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingUser(tableUser);
                        }}
                        aria-label={`Alterar usuário ${tableUser.name}`}
                        title="Alterar usuário"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-red-500/90 text-red-400 hover:border-red-400 hover:bg-red-500/15 hover:text-red-300 disabled:border-red-900/60 disabled:text-red-900/70"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeletingUser(tableUser);
                        }}
                        disabled={tableUser.id === user?.id}
                        aria-label={`Excluir usuário ${tableUser.name}`}
                        title={
                          tableUser.id === user?.id
                            ? "Não é permitido excluir o usuário logado."
                            : "Excluir usuário"
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>

      <Dialog
        open={Boolean(viewingUser)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingUser(null);
          }
        }}
      >
        <DialogContent className="max-w-md p-5">
          <DialogTitle className="sr-only">Detalhes do usuário</DialogTitle>
          {viewingUser ? <UserDetailsCard user={viewingUser} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (open) {
            resetCreate(EMPTY_CREATE_FORM);
            setIsCreatePasswordVisible(false);
          } else {
            setIsCreatePasswordVisible(false);
            resetCreate(EMPTY_CREATE_FORM);
          }
        }}
      >
        <StandardDialogContent
          title="Novo Usuário"
          description="Preencha os dados para cadastrar um novo usuário."
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsCreatePasswordVisible(false);
                  resetCreate(EMPTY_CREATE_FORM);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" form="create-user-form" disabled={isCreating}>
                {isCreating ? "Criando..." : "Criar usuário"}
              </Button>
            </>
          }
        >
          <form
            id="create-user-form"
            className="space-y-4"
            autoComplete="off"
            onSubmit={submitCreate(onCreateUser)}
          >
            <input
              type="text"
              name="fake-username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
            <input
              type="password"
              name="fake-password"
              autoComplete="current-password"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />

            <UserFormFields
              mode="create"
              idPrefix="create-user"
              nameField={registerCreate("name")}
              emailField={registerCreate("email")}
              passwordField={registerCreate("password")}
              avatarField={registerCreate("avatarUrl")}
              avatarUrl={createAvatarUrl}
              onAvatarUrlChange={(nextAvatarUrl) => {
                setCreateValue("avatarUrl", nextAvatarUrl, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              isPasswordVisible={isCreatePasswordVisible}
              onTogglePasswordVisibility={() =>
                setIsCreatePasswordVisible((previousState) => !previousState)
              }
              nameError={createErrors.name?.message}
              emailError={createErrors.email?.message}
              passwordError={createErrors.password?.message}
              avatarError={createErrors.avatarUrl?.message}
            />
          </form>
        </StandardDialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
      >
        <StandardDialogContent
          title="Alterar usuário"
          description="Atualize os dados principais do usuário selecionado."
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" form="update-user-form" disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </Button>
            </>
          }
        >
          <form
            id="update-user-form"
            className="space-y-4"
            onSubmit={submitEdit(onUpdateUser)}
          >
            <UserFormFields
              mode="update"
              idPrefix="update-user"
              userId={editingUser?.id}
              nameField={registerEdit("name")}
              emailField={registerEdit("email")}
              avatarField={registerEdit("avatarUrl")}
              avatarUrl={editAvatarUrl}
              onAvatarUrlChange={(nextAvatarUrl) => {
                setEditValue("avatarUrl", nextAvatarUrl, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              nameError={editErrors.name?.message}
              emailError={editErrors.email?.message}
              avatarError={editErrors.avatarUrl?.message}
            />
          </form>
        </StandardDialogContent>
      </Dialog>

      {deletingUser ? (
        <DeleteConfirmationDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setDeletingUser(null);
            }
          }}
          title="Excluir usuário"
          description="Esta ação remove o usuário selecionado de forma permanente."
          itemLabel="Usuário"
          itemValue={deletingUser.email}
          confirmWord="excluir"
          confirmLabel="Excluir usuário"
          onConfirm={onDeleteUser}
          confirmDisabled={!canDeleteSelectedUser}
          confirmDisabledMessage={
            !canDeleteSelectedUser
              ? "Não é permitido excluir o usuário autenticado."
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
