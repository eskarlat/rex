import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

type ToastHandler = (toast: Omit<Toast, 'id'>) => void;

let globalHandler: ToastHandler | null = null;

export function setGlobalToastHandler(handler: ToastHandler | null): void {
  globalHandler = handler;
}

export function showToast(options: Omit<Toast, 'id'>): void {
  if (globalHandler) {
    globalHandler(options);
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const removeAfterDelay = useCallback((toastId: string) => {
    setTimeout(() => removeToast(toastId), 4000);
  }, [removeToast]);

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const bytes = new Uint8Array(4);
    globalThis.crypto.getRandomValues(bytes);
    const id = `${Date.now()}-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
    setToasts((prev) => [...prev, { ...options, id }]);
    removeAfterDelay(id);
  }, [removeAfterDelay]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    setGlobalToastHandler(addToast);
    return () => { setGlobalToastHandler(null); };
  }, [addToast]);

  return { toasts, dismiss };
}
