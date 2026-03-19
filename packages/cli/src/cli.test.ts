import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock infrastructure
const mockDetect = vi.fn().mockReturnValue('/mock/project');
vi.mock('./core/project/project-manager.js', () => ({
  ProjectManager: vi.fn().mockImplementation(() => ({
    detect: mockDetect,
  })),
}));
vi.mock('./core/event-bus/event-bus.js', () => ({
  EventBus: vi.fn().mockImplementation(() => ({})),
}));
vi.mock('./core/paths/paths.js', () => ({
  getExtensionDir: vi.fn().mockImplementation((name: string, version: string) => `/mock/extensions/${name}@${version}`),
  getManifestPath: vi.fn().mockImplementation((p: string) => `${p}/.renre-kit/manifest.json`),
}));
vi.mock('./shared/fs-helpers.js', () => ({
  pathExistsSync: vi.fn().mockReturnValue(true),
  readJsonSync: vi.fn().mockReturnValue({ name: 'my-project', version: '1.0.0', created_at: '' }),
}));
const mockGetConnection = vi.fn();
const mockExecuteToolCall = vi.fn().mockResolvedValue('mcp result');
vi.mock('./features/extensions/mcp/connection-manager.js', () => ({
  ConnectionManager: vi.fn().mockImplementation(() => ({
    status: vi.fn().mockReturnValue(new Map()),
    restart: vi.fn().mockResolvedValue({ extensionName: '', transport: 'stdio', state: 'running', retryCount: 0 }),
    getConnection: (...args: unknown[]) => mockGetConnection(...args),
    executeToolCall: (...args: unknown[]) => mockExecuteToolCall(...args),
  })),
}));
vi.mock('./features/config/config-manager.js', () => ({
  loadGlobalConfig: vi.fn().mockReturnValue({ registries: [], settings: {}, extensionConfigs: {} }),
  resolveExtensionConfig: vi.fn().mockReturnValue({}),
}));
vi.mock('./features/extensions/manager/extension-manager.js', () => ({
  listInstalled: vi.fn().mockReturnValue([
    { name: 'my-ext', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
  ]),
  getActivated: vi.fn().mockReturnValue({}),
}));
const mockLoadManifest = vi.fn().mockImplementation(() => { throw new Error('no manifest'); });
vi.mock('./features/extensions/manifest/manifest-loader.js', () => ({
  loadManifest: (...args: unknown[]) => mockLoadManifest(...args),
}));
const mockExecuteCommand = vi.fn().mockResolvedValue(undefined);
const mockLoadCommandHandler = vi.fn().mockResolvedValue(vi.fn());
vi.mock('./features/extensions/runtime/standard-runtime.js', () => ({
  loadCommandHandler: (...args: unknown[]) => mockLoadCommandHandler(...args),
  executeCommand: (...args: unknown[]) => mockExecuteCommand(...args),
}));

// Mock all command handlers
vi.mock('./features/project/commands/init.command.js', () => ({
  handleInit: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/project/commands/destroy.command.js', () => ({
  handleDestroy: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-add.command.js', () => ({
  handleExtAdd: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-remove.command.js', () => ({
  handleExtRemove: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-list.command.js', () => ({
  handleExtList: vi.fn(),
}));
vi.mock('./features/extensions/commands/ext-activate.command.js', () => ({
  handleExtActivate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-deactivate.command.js', () => ({
  handleExtDeactivate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-config.command.js', () => ({
  handleExtConfig: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-status.command.js', () => ({
  handleExtStatus: vi.fn(),
}));
vi.mock('./features/extensions/commands/ext-restart.command.js', () => ({
  handleExtRestart: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-outdated.command.js', () => ({
  handleExtOutdated: vi.fn(),
}));
vi.mock('./features/extensions/commands/ext-update.command.js', () => ({
  handleExtUpdate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/extensions/commands/ext-cleanup.command.js', () => ({
  handleExtCleanup: vi.fn(),
}));
vi.mock('./features/registry/commands/registry-sync.command.js', () => ({
  handleRegistrySync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/registry/commands/registry-list.command.js', () => ({
  handleRegistryList: vi.fn(),
}));
vi.mock('./features/registry/commands/registry-add.command.js', () => ({
  handleRegistryAdd: vi.fn(),
}));
vi.mock('./features/registry/commands/registry-remove.command.js', () => ({
  handleRegistryRemove: vi.fn(),
}));
vi.mock('./features/registry/commands/registry-search.command.js', () => ({
  handleRegistrySearch: vi.fn(),
}));
vi.mock('./features/skills/commands/capabilities.command.js', () => ({
  handleCapabilities: vi.fn(),
}));
vi.mock('./features/vault/commands/vault-set.command.js', () => ({
  handleVaultSet: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/vault/commands/vault-list.command.js', () => ({
  handleVaultList: vi.fn(),
}));
vi.mock('./features/vault/commands/vault-remove.command.js', () => ({
  handleVaultRemove: vi.fn(),
}));
vi.mock('./features/scheduler/commands/scheduler-list.command.js', () => ({
  handleSchedulerList: vi.fn(),
}));
vi.mock('./features/scheduler/commands/scheduler-trigger.command.js', () => ({
  handleSchedulerTrigger: vi.fn(),
}));
const mockHandleUi = vi.fn();
vi.mock('./features/ui/commands/ui.command.js', () => ({
  handleUi: (...args: unknown[]) => mockHandleUi(...args),
}));
const mockHandleStop = vi.fn();
vi.mock('./features/ui/commands/stop.command.js', () => ({
  handleStop: (...args: unknown[]) => mockHandleStop(...args),
}));
vi.mock('./core/database/database.js', () => ({
  getDb: vi.fn(() => ({})),
}));

import { createProgram } from './cli.js';
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
import { handleRegistryAdd } from './features/registry/commands/registry-add.command.js';
import { handleRegistryRemove } from './features/registry/commands/registry-remove.command.js';
import { handleRegistrySearch } from './features/registry/commands/registry-search.command.js';
import { handleCapabilities } from './features/skills/commands/capabilities.command.js';
import { handleExtOutdated } from './features/extensions/commands/ext-outdated.command.js';
import { handleExtUpdate } from './features/extensions/commands/ext-update.command.js';
import { handleExtCleanup } from './features/extensions/commands/ext-cleanup.command.js';
import { handleVaultSet } from './features/vault/commands/vault-set.command.js';
import { handleVaultList } from './features/vault/commands/vault-list.command.js';
import { handleVaultRemove } from './features/vault/commands/vault-remove.command.js';
import { getActivated } from './features/extensions/manager/extension-manager.js';
import { handleSchedulerList } from './features/scheduler/commands/scheduler-list.command.js';
import { handleSchedulerTrigger } from './features/scheduler/commands/scheduler-trigger.command.js';

describe('cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Commander program with correct name and version', () => {
    const program = createProgram();
    expect(program.name()).toBe('renre-kit');
    expect(program.version()).toBe('0.0.1');
  });

  it('runs init command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'init']);
    expect(handleInit).toHaveBeenCalledWith(expect.objectContaining({
      projectPath: expect.any(String),
    }));
  });

  it('runs destroy command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'destroy']);
    expect(handleDestroy).toHaveBeenCalledWith(expect.objectContaining({
      projectPath: expect.any(String),
    }));
  });

  it('passes --force global flag to destroy', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', '--force', 'destroy']);
    expect(handleDestroy).toHaveBeenCalledWith(expect.objectContaining({
      force: true,
    }));
  });

  it('runs ext:add command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:add', 'my-ext']);
    expect(handleExtAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('runs ext:remove command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:remove', 'my-ext']);
    expect(handleExtRemove).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('runs ext:list command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:list']);
    expect(handleExtList).toHaveBeenCalled();
  });

  it('runs ext:activate command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:activate', 'my-ext']);
    expect(handleExtActivate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('parses name@version format in ext:activate', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:activate', 'my-ext@1.0.0']);
    expect(handleExtActivate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
      version: '1.0.0',
    }));
  });

  it('parses name@version format in ext:remove', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:remove', 'my-ext@1.0.0']);
    expect(handleExtRemove).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
      version: '1.0.0',
    }));
  });

  it('parses name@version format in ext:deactivate', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'my-ext': '1.0.0' });
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:deactivate', 'my-ext@1.0.0']);
    expect(handleExtDeactivate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
    vi.mocked(getActivated).mockReturnValue({});
  });

  it('runs ext:deactivate command', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'my-ext': '1.0.0' });
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:deactivate', 'my-ext']);
    expect(handleExtDeactivate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
    vi.mocked(getActivated).mockReturnValue({});
  });

  it('runs ext:config command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:config', 'my-ext']);
    expect(handleExtConfig).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('runs ext:status command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:status']);
    expect(handleExtStatus).toHaveBeenCalled();
  });

  it('runs ext:restart command', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'my-ext': '1.0.0' });
    mockLoadManifest.mockReturnValue({
      name: 'my-ext',
      version: '1.0.0',
      description: 'Test MCP',
      type: 'mcp',
      mcp: { transport: 'stdio', command: 'node', args: ['server.js'] },
      commands: {},
    });
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:restart', 'my-ext']);
    expect(handleExtRestart).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
    vi.mocked(getActivated).mockReturnValue({});
    mockLoadManifest.mockImplementation(() => { throw new Error('no manifest'); });
  });

  it('runs registry:sync command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:sync']);
    expect(handleRegistrySync).toHaveBeenCalled();
  });

  it('runs registry:list command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:list']);
    expect(handleRegistryList).toHaveBeenCalled();
  });

  it('runs registry:add command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:add', 'internal', 'https://github.com/company/reg.git']);
    expect(handleRegistryAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: 'internal',
      url: 'https://github.com/company/reg.git',
    }));
  });

  it('runs registry:remove command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:remove', 'internal']);
    expect(handleRegistryRemove).toHaveBeenCalledWith(expect.objectContaining({
      name: 'internal',
    }));
  });

  it('runs registry:search command with query', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:search', 'hello']);
    expect(handleRegistrySearch).toHaveBeenCalledWith(expect.objectContaining({
      query: 'hello',
    }));
  });

  it('runs registry:search with --type and --tag flags', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'registry:search', '--type', 'mcp', '--tag', 'example']);
    expect(handleRegistrySearch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'mcp',
      tag: 'example',
    }));
  });

  it('runs capabilities command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'capabilities']);
    expect(handleCapabilities).toHaveBeenCalledWith(expect.objectContaining({
      projectPath: expect.any(String),
    }));
  });

  it('runs ext:outdated command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:outdated']);
    expect(handleExtOutdated).toHaveBeenCalled();
  });

  it('runs ext:update command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:update', 'my-ext']);
    expect(handleExtUpdate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('runs ext:cleanup command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:cleanup']);
    expect(handleExtCleanup).toHaveBeenCalled();
  });

  it('runs vault:set command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'vault:set', 'my-key', '--secret', '--value', 'my-val']);
    expect(handleVaultSet).toHaveBeenCalledWith(expect.objectContaining({
      key: 'my-key',
      value: 'my-val',
      secret: true,
    }));
  });

  it('runs vault:list command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'vault:list']);
    expect(handleVaultList).toHaveBeenCalled();
  });

  it('runs vault:remove command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'vault:remove', 'my-key']);
    expect(handleVaultRemove).toHaveBeenCalledWith(expect.objectContaining({
      key: 'my-key',
    }));
  });

  it('runs scheduler:list command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'scheduler:list']);
    expect(handleSchedulerList).toHaveBeenCalled();
  });

  it('runs scheduler:trigger command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'scheduler:trigger', 'task-1']);
    expect(handleSchedulerTrigger).toHaveBeenCalledWith(expect.objectContaining({
      taskId: 'task-1',
    }));
  });

  it('registers dynamic extension commands from activated plugins', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'figma': '1.2.0' });
    mockLoadManifest.mockReturnValue({
      name: 'figma',
      version: '1.2.0',
      description: 'Figma extension',
      type: 'standard',
      commands: { content: { handler: 'commands/content.js', description: 'Get Figma content' } },
    });
    const handler = vi.fn().mockResolvedValue('ok');
    mockLoadCommandHandler.mockResolvedValue(handler);

    const program = createProgram();
    program.exitOverride();

    // The command figma:content should be registered
    const cmd = program.commands.find((c) => c.name() === 'figma:content');
    expect(cmd).toBeDefined();

    await program.parseAsync(['node', 'renre-kit', 'figma:content']);
    expect(mockLoadCommandHandler).toHaveBeenCalled();
    expect(mockExecuteCommand).toHaveBeenCalledWith(
      handler,
      expect.objectContaining({ projectPath: '/mock/project', projectName: 'my-project' }),
    );
  });

  it('skips extensions with missing manifests during dynamic loading', () => {
    vi.mocked(getActivated).mockReturnValue({ 'broken-ext': '1.0.0' });
    mockLoadManifest.mockImplementation(() => { throw new Error('not found'); });

    const program = createProgram();
    const cmd = program.commands.find((c) => c.name() === 'broken-ext:anything');
    expect(cmd).toBeUndefined();
  });

  it('skips extensions with empty version in plugins', () => {
    vi.mocked(getActivated).mockReturnValue({ 'empty-ext': '' });

    const program = createProgram();
    const cmd = program.commands.find((c) => c.name().startsWith('empty-ext:'));
    expect(cmd).toBeUndefined();
  });

  it('does not register extension commands when no project detected', () => {
    mockDetect.mockReturnValue(null);

    const program = createProgram();
    // Should not crash and core commands should still exist
    expect(program.commands.find((c) => c.name() === 'init')).toBeDefined();

    mockDetect.mockReturnValue('/mock/project');
  });

  it('routes MCP extension commands through ConnectionManager', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'mcp-ext': '1.0.0' });
    mockLoadManifest.mockReturnValue({
      name: 'mcp-ext',
      version: '1.0.0',
      description: 'MCP extension',
      type: 'mcp',
      mcp: { transport: 'stdio', command: 'node', args: ['server/index.js'] },
      commands: {},
    });

    // MCP extensions use catch-all routing: any mcp-ext:{tool} is forwarded to the MCP server
    const originalArgv = process.argv;
    process.argv = ['node', 'renre-kit', 'mcp-ext:query', 'arg1'];

    const program = createProgram();
    program.exitOverride();
    try {
      await program.parseAsync(process.argv);
    } catch {
      // Commander may throw for unknown command before our override runs
    }

    expect(mockGetConnection).toHaveBeenCalledWith('mcp-ext', expect.objectContaining({ transport: 'stdio' }), expect.any(Object));
    expect(mockExecuteToolCall).toHaveBeenCalledWith('mcp-ext', 'query', expect.objectContaining({ _positional: ['arg1'] }));

    process.argv = originalArgv;
  });

  it('uses default description when extension command has none', async () => {
    vi.mocked(getActivated).mockReturnValue({ 'my-tool': '1.0.0' });
    mockLoadManifest.mockReturnValue({
      name: 'my-tool',
      version: '1.0.0',
      description: 'A tool',
      type: 'standard',
      commands: { run: { handler: 'commands/run.js' } },
    });

    const program = createProgram();
    const cmd = program.commands.find((c) => c.name() === 'my-tool:run');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Run my-tool:run');
  });

  it('runs ui command with default port', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ui', '--no-browser']);
    expect(mockHandleUi).toHaveBeenCalledWith(expect.objectContaining({
      port: 4200,
      noBrowser: true,
    }));
  });

  it('rejects invalid port for ui command', async () => {
    const program = createProgram();
    program.exitOverride();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await program.parseAsync(['node', 'renre-kit', 'ui', '--port', 'abc']);
    } catch {
      // expected
    }

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid port'));
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it('rejects out-of-range port for ui command', async () => {
    const program = createProgram();
    program.exitOverride();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await program.parseAsync(['node', 'renre-kit', 'ui', '--port', '99999']);
    } catch {
      // expected
    }

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid port'));
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it('runs stop command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'stop']);
    expect(mockHandleStop).toHaveBeenCalled();
  });

  it('shows suggestions for unknown commands', async () => {
    const program = createProgram();
    program.exitOverride();
    let errorMessage = '';
    program.configureOutput({
      writeErr: (str: string) => { errorMessage += str; },
      writeOut: () => {},
    });

    try {
      await program.parseAsync(['node', 'renre-kit', 'inti']);
    } catch {
      // Commander throws on unknown command with exitOverride
    }

    expect(errorMessage).toContain('Did you mean');
  });
});
