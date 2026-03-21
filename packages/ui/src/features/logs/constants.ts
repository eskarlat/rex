import type { ReactNode } from 'react';
import { AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';
import { createElement } from 'react';

export const LEVEL_VARIANT: Record<string, string> = {
  debug: 'text-muted-foreground bg-muted',
  info: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  warn: 'text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
  error: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950',
};

export const LEVEL_ICON: Record<string, ReactNode> = {
  debug: createElement(Bug, { className: 'size-3' }),
  info: createElement(Info, { className: 'size-3' }),
  warn: createElement(AlertTriangle, { className: 'size-3' }),
  error: createElement(AlertCircle, { className: 'size-3' }),
};

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return iso;
  }
}
