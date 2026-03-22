import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getActiveProjectPath } from '@/core/api/client';
import { showToast } from '@/core/hooks/use-toast';

type InstallStep = 'idle' | 'resolving' | 'downloading' | 'installing' | 'done' | 'error';

const STEP_LABELS: Record<InstallStep, string> = {
  idle: '',
  resolving: 'Resolving...',
  downloading: 'Downloading...',
  installing: 'Installing...',
  done: 'Installed',
  error: 'Failed',
};

const STEP_PROGRESS: Record<InstallStep, number> = {
  idle: 0,
  resolving: 15,
  downloading: 50,
  installing: 85,
  done: 100,
  error: 0,
};

export interface InstallProgressState {
  step: InstallStep;
  extensionName: string | null;
}

function parseSSEEvents(chunk: string): Array<Record<string, unknown>> {
  return chunk
    .split('\n\n')
    .filter((block) => block.startsWith('data: '))
    .map((block) => JSON.parse(block.slice(6).trim()) as Record<string, unknown>);
}

async function readSSEStream(
  response: Response,
  onStep: (step: InstallStep) => void,
  onError: (message: string) => void,
): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = parseSSEEvents(buffer);
    const lastNewline = buffer.lastIndexOf('\n\n');
    buffer = lastNewline >= 0 ? buffer.slice(lastNewline + 2) : buffer;

    for (const event of events) {
      const step = event.step as InstallStep;
      if (step === 'error') {
        onError((event.error as string) ?? 'Unknown error');
        return;
      }
      onStep(step);
    }
  }
}

export function useInstallProgress() {
  const [state, setState] = useState<InstallProgressState>({ step: 'idle', extensionName: null });
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const startInstall = useCallback(
    async (name: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ step: 'resolving', extensionName: name });

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };
        const projectPath = getActiveProjectPath();
        if (projectPath) {
          headers['X-RenreKit-Project'] = projectPath;
        }

        const response = await fetch('/api/extensions/install', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Install failed: ${response.statusText}`);
        }

        await readSSEStream(
          response,
          (step) => setState((prev) => ({ ...prev, step })),
          (message) => {
            setState({ step: 'error', extensionName: name });
            showToast({ title: `Failed to install ${name}`, description: message, variant: 'destructive' });
          },
        );

        void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
        showToast({ title: `Installed ${name}` });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setState({ step: 'error', extensionName: name });
        showToast({ title: `Failed to install ${name}`, description: message, variant: 'destructive' });
      }
    },
    [queryClient],
  );

  return { state, startInstall };
}

interface InstallProgressBarProps {
  state: InstallProgressState;
}

export function InstallProgressBar({ state }: Readonly<InstallProgressBarProps>) {
  const label = STEP_LABELS[state.step];
  const progress = STEP_PROGRESS[state.step];

  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${String(progress)}%` }}
        />
      </div>
    </div>
  );
}
