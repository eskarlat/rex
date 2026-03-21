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
import { handleExtLink } from './features/extensions/commands/ext-link.command.js';
import { handleRegistrySync } from './features/registry/commands/registry-sync.command.js';
import { handleRegistryList } from './features/registry/commands/registry-list.command.js';
import { handleRegistryAdd } from './features/registry/commands/registry-add.command.js';
import { handleRegistryRemove } from './features/registry/commands/registry-remove.command.js';
import { handleRegistrySearch } from './features/registry/commands/registry-search.command.js';
import { handleCapabilities } from './features/skills/commands/capabilities.command.js';
import { handleDoctor } from './features/doctor/commands/doctor.command.js';
import { handleVaultSet } from './features/vault/commands/vault-set.command.js';
import { handleVaultList } from './features/vault/commands/vault-list.command.js';
import { handleVaultRemove } from './features/vault/commands/vault-remove.command.js';
import { handleSchedulerList } from './features/scheduler/commands/scheduler-list.command.js';
import { handleSchedulerTrigger } from './features/scheduler/commands/scheduler-trigger.command.js';
import { handleUi } from './features/ui/commands/ui.command.js';
import { handleStop } from './features/ui/commands/stop.command.js';
import { getDb } from './core/database/database.js';
import { getExtensionDir } from './core/paths/paths.js';
import { ConnectionManager } from './features/extensions/mcp/connection-manager.js';
import { loadGlobalConfig, resolveExtensionConfig } from './features/config/config-manager.js';
import { listInstalled, getActivated } from './features/extensions/manager/extension-manager.js';
import { ProjectManager } from './core/project/project-manager.js';
import { EventBus } from './core/event-bus/event-bus.js';
import { loadManifest } from './features/extensions/manifest/manifest-loader.js';
import {
  loadCommandHandler,
  executeCommand,
} from './features/extensions/runtime/standard-runtime.js';
import { getManifestPath } from './core/paths/paths.js';
import { pathExistsSync, readJsonSync } from './shared/fs-helpers.js';
import { parseCliArgs } from './shared/cli-args.js';
import type { ProjectManifest } from './core/types/project.types.js';
import { CLI_VERSION } from './core/version.js';
import { createExtensionLogger } from './core/logger/extension-logger.js';

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

function parseExtensionRef(nameArg: string): { name: string; version: string | undefined } {
  const atIndex = nameArg.lastIndexOf('@');
  if (atIndex > 0) {
    return { name: nameArg.slice(0, atIndex), version: nameArg.slice(atIndex + 1) };
  }
  return { name: nameArg, version: undefined };
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

function getProjectName(projectPath: string): string {
  const manifestPath = getManifestPath(projectPath);
  if (pathExistsSync(manifestPath)) {
    const manifest = readJsonSync<ProjectManifest>(manifestPath);
    return manifest.name;
  }
  return '';
}

interface McpExtensionEntry {
  mcpConfig: import('./features/extensions/types/extension.types.js').McpConfig;
  resolvedConfig: Record<string, unknown>;
  extDir: string;
}

function formatCommandResult(result: unknown): string {
  if (typeof result === 'string') return result;
  if (
    result !== null &&
    typeof result === 'object' &&
    'output' in result &&
    typeof (result as Record<string, unknown>).output === 'string'
  ) {
    return (result as Record<string, unknown>).output as string;
  }
  return JSON.stringify(result, null, 2);
}

function formatMcpResult(result: unknown): string {
  if (typeof result === 'string') return result;
  if (result !== null && typeof result === 'object' && 'content' in result) {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.content)) {
      const texts = (obj.content as Record<string, unknown>[])
        .filter((item) => item.type === 'text')
        .map((item) => String(item.text));
      if (texts.length > 0) return texts.join('\n');
    }
  }
  return JSON.stringify(result, null, 2);
}

function registerExtensionCommands(
  program: Command,
  projectPath: string,
  connectionManager: ConnectionManager,
): void {
  const plugins = getActivated(projectPath);
  const projectName = getProjectName(projectPath);
  const mcpExtensions = new Map<string, McpExtensionEntry>();

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

    // MCP extensions: store config so the catch-all forwards unknown tools to the MCP server
    if (manifest.type === 'mcp' && manifest.mcp) {
      mcpExtensions.set(extName, { mcpConfig: manifest.mcp, resolvedConfig, extDir });
    }

    // Register declared commands as file-based handlers (both standard and MCP extensions)
    for (const [cmdName, cmdDef] of Object.entries(manifest.commands)) {
      const fullName = `${extName}:${cmdName}`;
      const description = cmdDef.description ?? `Run ${fullName}`;

      program
        .command(`${fullName} [args...]`)
        .description(description)
        .allowUnknownOption(true)
        .action(async (args: string[], _opts: unknown, command: Command) => {
          const parsedOpts: Record<string, unknown> = command.opts();
          const context = {
            projectName,
            projectPath,
            args: { _positional: args, ...parsedOpts },
            config: resolvedConfig,
            logger: createExtensionLogger(extName),
          };

          const handler = await loadCommandHandler(extDir, cmdDef.handler);
          const result = await executeCommand(handler, context);
          if (result !== undefined) {
            process.stdout.write(formatCommandResult(result));
            process.stdout.write('\n');
          }
        });
    }
  }

  // MCP catch-all: intercept unknown commands matching {mcpExt}:{tool} pattern
  if (mcpExtensions.size > 0) {
    program.on('command:*', (operands: string[]) => {
      const input = operands[0] ?? '';
      const colonIdx = input.indexOf(':');
      if (colonIdx > 0) {
        const extName = input.substring(0, colonIdx);
        const tool = input.substring(colonIdx + 1);
        const entry = mcpExtensions.get(extName);
        if (entry && tool) {
          const rawArgs = process.argv.slice(3);
          const parsedArgs = parseCliArgs(rawArgs);
          connectionManager.getConnection(
            extName,
            entry.mcpConfig,
            entry.resolvedConfig,
            entry.extDir,
          );
          connectionManager.executeToolCall(extName, tool, parsedArgs).then(
            (result) => {
              if (result !== undefined) {
                const text = formatMcpResult(result);
                const isError =
                  typeof result === 'object' &&
                  result !== null &&
                  (result as Record<string, unknown>).isError === true;
                if (isError) {
                  process.stderr.write(text + '\n');
                  process.exitCode = 1;
                } else {
                  process.stdout.write(text + '\n');
                }
              }
            },
            (err: unknown) => {
              const message = err instanceof Error ? err.message : String(err);
              process.stderr.write(`Error: ${message}\n`);
              process.exitCode = 1;
            },
          );
          return;
        }
      }
      program.error(`error: unknown command '${input}'`, { exitCode: 1 });
    });
  }
}

export function createProgram(): Command {
  const program = new Command();
  const connectionManager = new ConnectionManager();

  program
    .name('renre-kit')
    .version(CLI_VERSION)
    .description('RenreKit CLI — lightweight plugin-driven development CLI')
    .option('--verbose', 'Enable verbose output')
    .option('--quiet', 'Suppress non-essential output')
    .option('--force', 'Skip confirmation prompts')
    .showSuggestionAfterError(true);

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
    .command('ext:link <path>')
    .description('Link a local extension for development (symlink, changes reflect immediately)')
    .action(async (localPath: string) => {
      await handleExtLink({
        localPath,
        projectPath: detectProject(),
      });
    });

  program
    .command('ext:remove <name>')
    .description('Remove an extension')
    .option('--version <version>', 'Extension version', 'latest')
    .action(async (nameArg: string, opts: { version: string }) => {
      const ref = parseExtensionRef(nameArg);
      const name = ref.name;
      await handleExtRemove({
        name,
        version: resolveExtensionVersion(name, ref.version ?? opts.version),
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
    .action(async (nameArg: string, opts: { version: string }) => {
      const projectPath = requireProject();
      const ref = parseExtensionRef(nameArg);
      const name = ref.name;
      const version = resolveExtensionVersion(name, ref.version ?? opts.version);
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
    .action(async (nameArg: string) => {
      const projectPath = requireProject();
      const name = parseExtensionRef(nameArg).name;
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
      const projectDir = detectProject();
      const plugins = getActivated(projectDir ?? process.cwd());
      const extVersion = plugins[name];
      if (!extVersion) {
        throw new Error(`Extension "${name}" is not activated in this project.`);
      }
      const extDir = getExtensionDir(name, extVersion);
      const extManifest = loadManifest(extDir);
      if (!extManifest.mcp) {
        throw new Error(`Extension "${name}" is not an MCP extension.`);
      }
      const configSchema = extManifest.config?.schema ?? {};
      const resolved = resolveExtensionConfig(name, configSchema, projectDir ?? undefined);
      await handleExtRestart({
        name,
        restartFn: (extName) => connectionManager.restart(extName, extManifest.mcp!, resolved),
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

  program
    .command('registry:add <name> <url>')
    .description('Add a new extension registry')
    .option('--priority <number>', 'Resolution priority (lower = higher)', '100')
    .option('--cache-ttl <seconds>', 'Cache TTL in seconds', '3600')
    .action((name: string, url: string, opts: { priority: string; cacheTtl: string }) => {
      const priority = parseInt(opts.priority, 10);
      const cacheTTL = parseInt(opts.cacheTtl, 10);

      if (!Number.isFinite(priority) || priority < 0) {
        process.stderr.write('Error: --priority must be a non-negative integer\n');
        process.exitCode = 1;
        return;
      }
      if (!Number.isFinite(cacheTTL) || cacheTTL < 0) {
        process.stderr.write('Error: --cache-ttl must be a non-negative integer\n');
        process.exitCode = 1;
        return;
      }

      handleRegistryAdd({
        name,
        url,
        priority,
        cacheTTL,
      });
    });

  program
    .command('registry:remove <name>')
    .description('Remove an extension registry')
    .action((name: string) => {
      handleRegistryRemove({ name });
    });

  program
    .command('registry:search [query]')
    .description('Search available extensions in registries')
    .option('--type <type>', 'Filter by extension type (standard or mcp)')
    .option('--tag <tag>', 'Filter by tag')
    .action((query: string | undefined, opts: { type?: string; tag?: string }) => {
      const { registries } = loadGlobalConfig();
      const type = opts.type as 'standard' | 'mcp' | undefined;
      handleRegistrySearch({
        query,
        type,
        tag: opts.tag,
        configs: registries,
      });
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
    .option('--force', 'Force update even if engine is incompatible')
    .action(async (name: string | undefined, opts: { all?: boolean; force?: boolean }) => {
      const { registries } = loadGlobalConfig();
      await handleExtUpdate({
        name,
        all: !!opts.all,
        force: !!opts.force,
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
      const tags = opts.tags
        ? opts.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
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

  // UI command
  program
    .command('ui')
    .description('Start local web dashboard server and open browser')
    .option('--port <port>', 'Port to listen on', '4200')
    .option('--lan', 'Bind to 0.0.0.0 for LAN access')
    .option('--no-browser', 'Do not open browser automatically')
    .option('--no-sleep', 'Disable sleep prevention')
    .action(async (opts: { port: string; browser: boolean; sleep: boolean; lan?: boolean }) => {
      const port = Number(opts.port);
      if (!Number.isFinite(port) || !Number.isInteger(port) || port < 1 || port > 65535) {
        // eslint-disable-next-line no-console
        console.error(`Invalid port: "${opts.port}". Must be an integer between 1 and 65535.`);
        process.exit(1);
      }
      await handleUi({
        port,
        lan: !!opts.lan,
        noBrowser: !opts.browser,
        noSleep: !opts.sleep,
      });
    });

  // Stop command
  program
    .command('stop')
    .description('Stop the running dashboard server')
    .action(() => {
      handleStop();
    });

  // Skills command
  program
    .command('capabilities')
    .description('Show aggregated LLM skills')
    .action(() => {
      const projectPath = requireProject();
      handleCapabilities({ projectPath });
    });

  program
    .command('doctor')
    .description('Run diagnostic checks on the RenreKit installation')
    .action(async (): Promise<void> => {
      const projectPath = detectProject();
      const getActivatedFn = (): Record<string, string> =>
        projectPath ? getActivated(projectPath) : {};
      await handleDoctor(projectPath, getActivatedFn);
    });

  // Dynamic extension commands: load from activated extensions' manifests
  const projectPath = detectProject();
  if (projectPath) {
    registerExtensionCommands(program, projectPath, connectionManager);
  }

  return program;
}
