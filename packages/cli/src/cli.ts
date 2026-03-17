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
import { handleExtOutdated } from './features/extensions/commands/ext-outdated.command.js';
import { handleExtUpdate } from './features/extensions/commands/ext-update.command.js';
import { handleExtCleanup } from './features/extensions/commands/ext-cleanup.command.js';
import { handleRegistrySync } from './features/registry/commands/registry-sync.command.js';
import { handleRegistryList } from './features/registry/commands/registry-list.command.js';
import { handleCapabilities } from './features/skills/commands/capabilities.command.js';
import { handleVaultSet } from './features/vault/commands/vault-set.command.js';
import { handleVaultList } from './features/vault/commands/vault-list.command.js';
import { handleVaultRemove } from './features/vault/commands/vault-remove.command.js';
import { handleSchedulerList } from './features/scheduler/commands/scheduler-list.command.js';
import { handleSchedulerTrigger } from './features/scheduler/commands/scheduler-trigger.command.js';
import { getDb } from './core/database/database.js';
import { getExtensionDir } from './core/paths/paths.js';
import { ConnectionManager } from './features/extensions/mcp/connection-manager.js';
import { loadGlobalConfig, resolveExtensionConfig } from './features/config/config-manager.js';
import { listInstalled, getActivated } from './features/extensions/manager/extension-manager.js';
import { ProjectManager } from './core/project/project-manager.js';
import { EventBus } from './core/event-bus/event-bus.js';
import { loadManifest } from './features/extensions/manifest/manifest-loader.js';
import { loadCommandHandler, executeCommand } from './features/extensions/runtime/standard-runtime.js';

function detectProject(): string | null {
  const bus = new EventBus();
  const pm = new ProjectManager(bus);
  return pm.detect();
}

function requireProject(): string {
  const projectPath = detectProject();
  if (!projectPath) {
    throw new Error('No RenreKit project found. Run "renre-kit init" first.');
  }
  return projectPath;
}

function resolveExtensionVersion(name: string, version: string): string {
  if (version !== 'latest') {
    return version;
  }
  const db = getDb();
  const installed = listInstalled(db);
  const ext = installed.find((e) => e.name === name);
  if (!ext) {
    throw new Error(`Extension "${name}" is not installed.`);
  }
  return ext.version;
}

function registerExtensionCommands(
  program: Command,
  projectPath: string,
  connectionManager: ConnectionManager,
): void {
  const plugins = getActivated(projectPath);

  for (const [extName, version] of Object.entries(plugins)) {
    if (!version) continue;

    const extDir = getExtensionDir(extName, version);
    let manifest;
    try {
      manifest = loadManifest(extDir);
    } catch {
      continue; // Skip extensions with missing/invalid manifests
    }

    const configSchema = manifest.config?.schema ?? {};
    const resolvedConfig = resolveExtensionConfig(extName, configSchema, projectPath);

    for (const [cmdName, cmdDef] of Object.entries(manifest.commands)) {
      const fullName = `${extName}:${cmdName}`;
      const description = cmdDef.description ?? `Run ${fullName}`;

      program
        .command(`${fullName} [args...]`)
        .description(description)
        .allowUnknownOption(true)
        .action(async (args: string[], opts: Record<string, unknown>) => {
          const context = {
            projectName: extName,
            projectPath,
            args: { _positional: args, ...opts },
            config: resolvedConfig,
          };

          if (manifest.type === 'mcp' && manifest.mcp) {
            connectionManager.getConnection(extName, manifest.mcp, resolvedConfig);
            const result = await connectionManager.executeToolCall(
              extName,
              cmdDef.handler,
              context.args,
            );
            if (result !== undefined) {
              process.stdout.write(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
              process.stdout.write('\n');
            }
          } else {
            const handler = await loadCommandHandler(extDir, cmdDef.handler);
            const result = await executeCommand(handler, context);
            if (result !== undefined) {
              process.stdout.write(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
              process.stdout.write('\n');
            }
          }
        });
    }
  }
}

export function createProgram(): Command {
  const program = new Command();
  const connectionManager = new ConnectionManager();

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
      const projectPath = requireProject();
      await handleDestroy({
        projectPath,
        force: !!globalOpts['force'],
      });
    });

  // Extension commands
  program
    .command('ext:add <name>')
    .description('Add an extension')
    .action(async (name: string) => {
      const { registries } = loadGlobalConfig();
      await handleExtAdd({
        name,
        registryConfigs: registries,
        projectPath: detectProject(),
      });
    });

  program
    .command('ext:remove <name>')
    .description('Remove an extension')
    .option('--version <version>', 'Extension version', 'latest')
    .action(async (name: string, opts: { version: string }) => {
      await handleExtRemove({
        name,
        version: resolveExtensionVersion(name, opts.version),
        projectPath: detectProject(),
      });
    });

  program
    .command('ext:list')
    .description('List installed extensions')
    .action(() => {
      handleExtList({ projectPath: detectProject() ?? process.cwd() });
    });

  program
    .command('ext:activate <name>')
    .description('Activate an extension in the current project')
    .option('--version <version>', 'Extension version', 'latest')
    .action(async (name: string, opts: { version: string }) => {
      const projectPath = requireProject();
      const version = resolveExtensionVersion(name, opts.version);
      await handleExtActivate({
        name,
        version,
        projectPath,
        extensionDir: getExtensionDir(name, version),
      });
    });

  program
    .command('ext:deactivate <name>')
    .description('Deactivate an extension from the current project')
    .action(async (name: string) => {
      const projectPath = requireProject();
      const plugins = getActivated(projectPath);
      const version = plugins[name];
      if (!version) {
        throw new Error(`Extension "${name}" is not activated in this project.`);
      }
      await handleExtDeactivate({
        name,
        projectPath,
        extensionDir: getExtensionDir(name, version),
      });
    });

  program
    .command('ext:config <name>')
    .description('Configure an extension interactively')
    .action(async (name: string) => {
      const projectPath = detectProject() ?? process.cwd();
      await handleExtConfig({
        name,
        projectPath,
      });
    });

  program
    .command('ext:status')
    .description('Show MCP connection status')
    .action(() => {
      handleExtStatus(connectionManager.status());
    });

  program
    .command('ext:restart <name>')
    .description('Restart an MCP extension connection')
    .action(async (name: string) => {
      await handleExtRestart({
        name,
        restartFn: (extName) => connectionManager.restart(extName, { transport: 'stdio' }),
      });
    });

  // Registry commands
  program
    .command('registry:sync')
    .description('Sync all registries')
    .action(async () => {
      const { registries } = loadGlobalConfig();
      await handleRegistrySync({ configs: registries });
    });

  program
    .command('registry:list')
    .description('List configured registries')
    .action(() => {
      const { registries } = loadGlobalConfig();
      handleRegistryList({ configs: registries });
    });

  // Extension versioning commands
  program
    .command('ext:outdated')
    .description('Check for outdated extensions')
    .action(() => {
      const { registries } = loadGlobalConfig();
      handleExtOutdated({ registryConfigs: registries, db: getDb() });
    });

  program
    .command('ext:update [name]')
    .description('Update an extension to the latest version')
    .option('--all', 'Update all extensions')
    .action(async (name: string | undefined, opts: { all?: boolean }) => {
      const { registries } = loadGlobalConfig();
      await handleExtUpdate({
        name,
        all: !!opts.all,
        registryConfigs: registries,
        projectPath: detectProject() ?? process.cwd(),
        db: getDb(),
      });
    });

  program
    .command('ext:cleanup')
    .description('Remove unused extension versions')
    .action(() => {
      handleExtCleanup({ db: getDb() });
    });

  // Vault commands
  program
    .command('vault:set <key>')
    .description('Store a variable in the vault')
    .option('--secret', 'Encrypt the value at rest')
    .option('--tags <tags>', 'Comma-separated tags', '')
    .option('--value <value>', 'Value to store (prompted if omitted)')
    .action(async (key: string, opts: { secret?: boolean; tags: string; value?: string }) => {
      const tags = opts.tags ? opts.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      await handleVaultSet({
        key,
        value: opts.value,
        secret: !!opts.secret,
        tags,
      });
    });

  program
    .command('vault:list')
    .description('List all vault variables')
    .action(() => {
      handleVaultList();
    });

  program
    .command('vault:remove <key>')
    .description('Remove a variable from the vault')
    .action((key: string) => {
      handleVaultRemove({ key });
    });

  // Scheduler commands
  program
    .command('scheduler:list')
    .description('List all scheduled tasks for the current project')
    .action(() => {
      handleSchedulerList({ projectPath: detectProject(), db: getDb() });
    });

  program
    .command('scheduler:trigger <id>')
    .description('Manually trigger a scheduled task')
    .action((taskId: string) => {
      handleSchedulerTrigger({ taskId, db: getDb() });
    });

  // Skills command
  program
    .command('capabilities')
    .description('Show aggregated LLM skills')
    .action(() => {
      const projectPath = requireProject();
      handleCapabilities({ projectPath });
    });

  // Dynamic extension commands: load from activated extensions' manifests
  const projectPath = detectProject();
  if (projectPath) {
    registerExtensionCommands(program, projectPath, connectionManager);
  }

  return program;
}
