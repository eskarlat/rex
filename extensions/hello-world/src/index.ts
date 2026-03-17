import path from 'node:path';
import { deployAgentAssets, cleanupAgentAssets } from '@renre-kit/extension-sdk/node';

interface CommandResult {
  output: string;
  exitCode: number;
}

interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface HookContext {
  projectDir: string;
}

function getExtensionDir(): string {
  return path.resolve(import.meta.dirname, '..');
}

export function onInit(context: HookContext): void {
  deployAgentAssets(getExtensionDir(), context.projectDir);
}

export function onDestroy(context: HookContext): void {
  cleanupAgentAssets(getExtensionDir(), context.projectDir);
}

export function greet(context: ExecutionContext): CommandResult {
  const name = typeof context.args.name === 'string' ? context.args.name : 'World';
  return {
    output: `Hello, ${name}! Welcome to RenreKit.`,
    exitCode: 0,
  };
}

export function info(): CommandResult {
  return {
    output: 'hello-world v1.0.0 — A simple hello world extension for RenreKit',
    exitCode: 0,
  };
}
