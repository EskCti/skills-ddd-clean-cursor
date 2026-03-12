'use client';

import type { UserDTO } from '__AUTH_PACKAGE_NAME__';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest, register as registerRequest } from '../api/auth.service';
import {
  changePassword as changePasswordRequest,
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  findUserByEmail as findUserByEmailRequest,
  findUserById as findUserByIdRequest,
  getUsers as getUsersRequest,
  updateUser as updateUserRequest,
} from '../api/user.service';
import type { LoginFormData, RegisterFormData } from '../schemas/auth';
import type { ChangePasswordFormData, CreateUserFormData } from '../schemas/user';
import type { PaginatedResultDTO } from '__SHARED_PACKAGE_NAME__';
import type { FindAllUsersIn, UpdateUserPayload } from '../api/user.service';

const ACCESS_TOKEN_STORAGE_KEY = '__PROJECT_SCOPE_SLUG__.access_token';

type AuthContextType = {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (data: ChangePasswordFormData) => Promise<void>;
  createUser: (data: CreateUserFormData) => Promise<void>;
  findUserByEmail: (email: string) => Promise<UserDTO>;
  findUserById: (id: string) => Promise<UserDTO>;
  deleteUser: (id: string) => Promise<void>;
  getUsers: (query: FindAllUsersIn) => Promise<PaginatedResultDTO<UserDTO>>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function unauthorizedError() {
  return { errors: ['USER_UNAUTHORIZED'] };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const clearAuthState = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  }, []);

  const requireToken = useCallback((candidateToken: string | null): string => {
    if (!candidateToken) {
      throw unauthorizedError();
    }

    return candidateToken;
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = requireToken(token);
    const me = await getMe(activeToken);
    setUser(me);
    setIsAuthenticated(true);
  }, [requireToken, token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);

    getMe(token)
      .then((me) => {
        if (cancelled) {
          return;
        }

        setUser(me);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearAuthState();
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuthState, isHydrated, token]);

  const login = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);

      try {
        const response = await loginRequest(data);
        const nextToken = response.token;

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextToken);
        }

        setToken(nextToken);
        const me = await getMe(nextToken);
        setUser(me);
        setIsAuthenticated(true);
      } catch (error) {
        clearAuthState();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearAuthState],
  );

  const register = useCallback(async (data: RegisterFormData) => {
    await registerRequest(data);
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const changePassword = useCallback(
    async (data: ChangePasswordFormData) => {
      const activeToken = requireToken(token);
      await changePasswordRequest(activeToken, data);
    },
    [requireToken, token],
  );

  const createUser = useCallback(
    async (data: CreateUserFormData) => {
      const activeToken = requireToken(token);
      await createUserRequest(activeToken, {
        name: data.name,
        email: data.email,
        password: data.password,
        avatarUrl: data.avatarUrl?.trim() || undefined,
      });
    },
    [requireToken, token],
  );

  const findUserByEmail = useCallback(
    async (email: string) => {
      const activeToken = requireToken(token);
      return findUserByEmailRequest(activeToken, email);
    },
    [requireToken, token],
  );

  const findUserById = useCallback(
    async (id: string) => {
      const activeToken = requireToken(token);
      return findUserByIdRequest(activeToken, id);
    },
    [requireToken, token],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      const activeToken = requireToken(token);
      await deleteUserRequest(activeToken, id);
    },
    [requireToken, token],
  );

  const getUsers = useCallback(
    async (query: FindAllUsersIn) => {
      const activeToken = requireToken(token);
      return getUsersRequest(activeToken, query);
    },
    [requireToken, token],
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserPayload) => {
      const activeToken = requireToken(token);
      await updateUserRequest(activeToken, id, data);
    },
    [requireToken, token],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      changePassword,
      createUser,
      findUserByEmail,
      findUserById,
      deleteUser,
      getUsers,
      updateUser,
    }),
    [
      changePassword,
      createUser,
      deleteUser,
      findUserByEmail,
      findUserById,
      getUsers,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUser,
      register,
      token,
      updateUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
