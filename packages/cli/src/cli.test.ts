import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  handleExtConfig: vi.fn(),
}));
vi.mock('./features/extensions/commands/ext-status.command.js', () => ({
  handleExtStatus: vi.fn(),
}));
vi.mock('./features/extensions/commands/ext-restart.command.js', () => ({
  handleExtRestart: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/registry/commands/registry-sync.command.js', () => ({
  handleRegistrySync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./features/registry/commands/registry-list.command.js', () => ({
  handleRegistryList: vi.fn(),
}));
vi.mock('./features/skills/commands/capabilities.command.js', () => ({
  handleCapabilities: vi.fn(),
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
import { handleCapabilities } from './features/skills/commands/capabilities.command.js';

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

  it('runs ext:deactivate command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:deactivate', 'my-ext']);
    expect(handleExtDeactivate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
  });

  it('runs ext:config command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:config']);
    expect(handleExtConfig).toHaveBeenCalled();
  });

  it('runs ext:status command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:status']);
    expect(handleExtStatus).toHaveBeenCalled();
  });

  it('runs ext:restart command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'ext:restart', 'my-ext']);
    expect(handleExtRestart).toHaveBeenCalledWith(expect.objectContaining({
      name: 'my-ext',
    }));
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

  it('runs capabilities command', async () => {
    const program = createProgram();
    program.exitOverride();
    await program.parseAsync(['node', 'renre-kit', 'capabilities']);
    expect(handleCapabilities).toHaveBeenCalledWith(expect.objectContaining({
      projectPath: expect.any(String),
    }));
  });
});
