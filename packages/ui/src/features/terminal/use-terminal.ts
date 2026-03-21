import { createContext, useContext, useState, useCallback, useRef, createElement } from 'react';
import type { ReactNode } from 'react';

/** Sender function type for writing data to the terminal */
export type TerminalSender = (data: string) => void;

interface TerminalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  send: (data: string) => void;
  registerSender: (sender: TerminalSender) => void;
  unregisterSender: () => void;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const senderRef = useRef<TerminalSender | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const send = useCallback((data: string) => {
    if (senderRef.current) {
      senderRef.current(data);
    }
  }, []);

  const registerSender = useCallback((sender: TerminalSender) => {
    senderRef.current = sender;
  }, []);

  const unregisterSender = useCallback(() => {
    senderRef.current = null;
  }, []);

  return createElement(
    TerminalContext.Provider,
    { value: { isOpen, open, close, toggle, send, registerSender, unregisterSender } },
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
