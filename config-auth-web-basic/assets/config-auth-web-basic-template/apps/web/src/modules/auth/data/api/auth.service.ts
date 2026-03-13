import type { CreateUserIn, LoginIn, UserDTO } from '@poupig/auth';
import { apiRequest } from './http-client';

export type LoginResponse = {
  token: string;
};

export type RegisterPayload = CreateUserIn & {
  confirmPassword: string;
};

export async function login(data: LoginIn): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

export async function register(data: RegisterPayload): Promise<void> {
  await apiRequest<void>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function getMe(token: string): Promise<UserDTO> {
  return apiRequest<UserDTO>('/auth/me', {
    method: 'GET',
    token,
  });
}
