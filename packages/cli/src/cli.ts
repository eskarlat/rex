import { Command } from 'commander';
import { handleInit } from './features/project/commands/init.command.js';
import { handleDestroy } from './features/project/commands/destroy.command.js';
import { handleExtAdd } from './features/extensions/commands/ext-add.command.js';
import { handleExtRemove } from './features/extensions/commands/ext-remove.command.js';
import { handleExtList } from './features/extensions/commands/ext-list.command.js';
import { handleExtActivate } from './features/extensions/commands/ext-activate.command.js';
import { handleExtDeactivate } from './features/extensions/commands/ext-deactivate.command.js';
import { handleExtConfig } from './features/extensions/commands/ext-config.command.js';
import { handleExtStatus } from './features/extensions/commands/ext-status.command.js';
import { handleExtRestart } from './features/extensions/commands/ext-restart.command.js';
import { handleRegistrySync } from './features/registry/commands/registry-sync.command.js';
import { handleRegistryList } from './features/registry/commands/registry-list.command.js';
import { handleCapabilities } from './features/skills/commands/capabilities.command.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('renre-kit')
    .version('0.0.1')
    .description('RenreKit CLI — lightweight plugin-driven development CLI')
    .option('--verbose', 'Enable verbose output')
    .option('--quiet', 'Suppress non-essential output')
    .option('--force', 'Skip confirmation prompts');

  // Project commands
  program
    .command('init')
    .description('Initialize a new RenreKit project')
    .action(async (_opts: Record<string, unknown>, cmd: Command) => {
      const globalOpts: Record<string, unknown> = cmd.parent?.opts() ?? {};
      await handleInit({
        projectPath: process.cwd(),
        force: !!globalOpts['force'],
      });
    });

  program
    .command('destroy')
    .description('Destroy a RenreKit project')
    .action(async (_opts: Record<string, unknown>, cmd: Command) => {
      const globalOpts: Record<string, unknown> = cmd.parent?.opts() ?? {};
      await handleDestroy({
        projectPath: process.cwd(),
        force: !!globalOpts['force'],
      });
    });

  // Extension commands
  program
    .command('ext:add <name>')
    .description('Add an extension')
    .action(async (name: string) => {
      await handleExtAdd({
        name,
        registryConfigs: [],
        projectPath: process.cwd(),
      });
    });

  program
    .command('ext:remove <name>')
    .description('Remove an extension')
    .option('--version <version>', 'Extension version', 'latest')
    .action(async (name: string, opts: { version: string }) => {
      await handleExtRemove({
        name,
        version: opts.version,
        projectPath: process.cwd(),
      });
    });

  program
    .command('ext:list')
    .description('List installed extensions')
    .action(() => {
      handleExtList({ projectPath: process.cwd() });
    });

  program
    .command('ext:activate <name>')
    .description('Activate an extension in the current project')
    .option('--version <version>', 'Extension version', 'latest')
    .action(async (name: string, opts: { version: string }) => {
      await handleExtActivate({
        name,
        version: opts.version,
        projectPath: process.cwd(),
        extensionDir: '',
      });
    });

  program
    .command('ext:deactivate <name>')
    .description('Deactivate an extension from the current project')
    .action(async (name: string) => {
      await handleExtDeactivate({
        name,
        projectPath: process.cwd(),
        extensionDir: '',
      });
    });

  program
    .command('ext:config')
    .description('Manage extension configuration')
    .action(() => {
      handleExtConfig();
    });

  program
    .command('ext:status')
    .description('Show MCP connection status')
    .action(() => {
      handleExtStatus(new Map());
    });

  program
    .command('ext:restart <name>')
    .description('Restart an MCP extension connection')
    .action(async (name: string) => {
      await handleExtRestart({
        name,
        restartFn: () => {
          return Promise.reject(new Error('Connection manager not available in this context'));
        },
      });
    });

  // Registry commands
  program
    .command('registry:sync')
    .description('Sync all registries')
    .action(async () => {
      await handleRegistrySync({ configs: [] });
    });

  program
    .command('registry:list')
    .description('List configured registries')
    .action(() => {
      handleRegistryList({ configs: [] });
    });

  // Skills command
  program
    .command('capabilities')
    .description('Show aggregated LLM skills')
    .action(() => {
      handleCapabilities({ projectPath: process.cwd() });
    });

  return program;
}
