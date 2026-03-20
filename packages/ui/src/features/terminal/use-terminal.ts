import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

interface TerminalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return createElement(
    TerminalContext.Provider,
    { value: { isOpen, open, close, toggle } },
    children,
  );
}

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return ctx;
}
