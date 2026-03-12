import type { CreateUserIn, UserDTO } from '__AUTH_PACKAGE_NAME__';
import type { PaginatedResultDTO } from '__SHARED_PACKAGE_NAME__';
import { apiRequest } from './http-client';

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type FindAllUsersIn = {
  page: number;
  pageSize: number;
};

export type UpdateUserPayload = Partial<Pick<CreateUserIn, 'name' | 'email' | 'avatarUrl'>>;

export async function createUser(token: string, data: CreateUserIn): Promise<void> {
  await apiRequest<void>('/auth/user/create', {
    method: 'POST',
    token,
    body: data,
  });
}

export async function findUserByEmail(token: string, email: string): Promise<UserDTO> {
  return apiRequest<UserDTO>('/auth/users/by-email', {
    method: 'GET',
    token,
    query: { email },
  });
}

export async function findUserById(token: string, id: string): Promise<UserDTO> {
  return apiRequest<UserDTO>(`/auth/users/${id}`, {
    method: 'GET',
    token,
  });
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/auth/users/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getUsers(token: string, query: FindAllUsersIn): Promise<PaginatedResultDTO<UserDTO>> {
  return apiRequest<PaginatedResultDTO<UserDTO>>('/auth/users', {
    method: 'GET',
    token,
    query,
  });
}

export async function updateUser(token: string, id: string, data: UpdateUserPayload): Promise<void> {
  await apiRequest<void>(`/auth/users/${id}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export async function changePassword(token: string, data: ChangePasswordPayload): Promise<void> {
  await apiRequest<void>('/auth/password/change', {
    method: 'PATCH',
    token,
    body: data,
  });
}
