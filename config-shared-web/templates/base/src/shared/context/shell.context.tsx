'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMessage } from '../i18n';

type ShellContextValue = {
  isSidebarOpen: boolean;
  isMobile: boolean;
  setSidebarOpen: (next: boolean) => void;
  toggleSidebar: () => void;
};

type ShellProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const MOBILE_BREAKPOINT = 1024;

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children, defaultOpen = true }: ShellProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      isMobile,
      setSidebarOpen,
      toggleSidebar,
    }),
    [isSidebarOpen, isMobile, toggleSidebar],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShellContext() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error(getMessage('SHELL_CONTEXT_PROVIDER_REQUIRED'));
  }
  return context;
}
