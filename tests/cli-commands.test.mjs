/**
 * MJS integration tests for RenreKit CLI commands.
 *
 * These tests invoke the CLI binary as a subprocess and verify
 * that each command is registered, produces expected output,
 * and exits with the correct code.
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const CLI_BIN = join(import.meta.dirname, '..', 'packages', 'cli', 'bin', 'renre-kit.js');

/**
 * Run the CLI with the given arguments and return { stdout, stderr, code }.
 */
function runCli(args, options = {}) {
  return new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      [CLI_BIN, ...args],
      {
        timeout: 15_000,
        env: { ...process.env, HOME: options.home ?? process.env.HOME },
        cwd: options.cwd ?? process.cwd(),
      },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout?.toString() ?? '',
          stderr: stderr?.toString() ?? '',
          code: error?.code ?? 0,
        });
      },
    );
  });
}

/**
 * Run a CLI command in an isolated temp directory and assert it fails
 * with an error message about missing project.
 */
async function assertFailsWithoutProject(command, tmpPrefix, options = {}) {
  const noProjectDir = await mkdtemp(join(tmpdir(), tmpPrefix));
  try {
    const { code, stderr } = await runCli([command], { cwd: noProjectDir, ...options });
    assert.notEqual(code, 0, `${command} should fail without a project`);
    assert.ok(
      stderr.includes('No RenreKit project') || stderr.includes('Error'),
      'Should report missing project',
    );
  } finally {
    await rm(noProjectDir, { recursive: true, force: true });
  }
}

// ──────────────────────────────────────────────
// Test: CLI basics
// ──────────────────────────────────────────────

describe('CLI basics', () => {
  it('shows version with --version', async () => {
    const { stdout, code } = await runCli(['--version']);
    assert.equal(code, 0);
    assert.match(stdout, /\d+\.\d+\.\d+/);
  });

  it('shows help with --help', async () => {
    const { stdout, code } = await runCli(['--help']);
    assert.equal(code, 0);
    assert.ok(stdout.includes('renre-kit'), 'Help should mention renre-kit');
    assert.ok(stdout.includes('init'), 'Help should list init command');
  });

  it('suggests similar command on typo', async () => {
    const { stderr } = await runCli(['inti']);
    // Commander shows suggestion after error
    assert.ok(
      stderr.includes('init') || stderr.includes('Did you mean'),
      'Should suggest "init" for typo "inti"',
    );
  });
});

// ──────────────────────────────────────────────
// Test: command registration — each command shows help
// ──────────────────────────────────────────────

const CORE_COMMANDS = [
  'init',
  'destroy',
  'ext:add',
  'ext:remove',
  'ext:list',
  'ext:activate',
  'ext:deactivate',
  'ext:config',
  'ext:status',
  'ext:restart',
  'ext:outdated',
  'ext:update',
  'ext:cleanup',
  'registry:sync',
  'registry:list',
  'vault:set',
  'vault:list',
  'vault:remove',
  'scheduler:list',
  'scheduler:trigger',
  'capabilities',
  'ui',
];

describe('command registration', () => {
  it('all core commands appear in help output', async () => {
    const { stdout } = await runCli(['--help']);
    for (const cmd of CORE_COMMANDS) {
      assert.ok(
        stdout.includes(cmd),
        `Command "${cmd}" should be listed in --help output`,
      );
    }
  });

  for (const cmd of CORE_COMMANDS) {
    it(`"${cmd} --help" exits without error`, async () => {
      const { code } = await runCli([cmd, '--help']);
      assert.equal(code, 0, `"${cmd} --help" should exit with code 0`);
    });
  }
});

// ──────────────────────────────────────────────
// Test: project lifecycle (init / destroy)
// ──────────────────────────────────────────────

describe('project lifecycle', () => {
  let tempDir;
  let homeDir;

  before(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'renre-test-project-'));
    homeDir = await mkdtemp(join(tmpdir(), 'renre-test-home-'));
  });

  after(async () => {
    await rm(tempDir, { recursive: true, force: true });
    await rm(homeDir, { recursive: true, force: true });
  });

  it('init --help shows description', async () => {
    const { stdout, code } = await runCli(['init', '--help'], { cwd: tempDir, home: homeDir });
    assert.equal(code, 0);
    assert.ok(stdout.includes('Initialize'), 'Should describe initialization');
  });

  it('destroy fails when no project exists', async () => {
    await assertFailsWithoutProject('destroy', 'renre-no-project-', { home: homeDir });
  });
});

// ──────────────────────────────────────────────
// Test: extension commands (without project context)
// ──────────────────────────────────────────────

describe('extension commands', () => {
  let homeDir;

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-test-ext-'));
  });

  after(async () => {
    await rm(homeDir, { recursive: true, force: true });
  });

  it('ext:list runs without error', async () => {
    const { code } = await runCli(['ext:list'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('ext:status runs without error', async () => {
    const { code } = await runCli(['ext:status'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('ext:outdated runs without error', async () => {
    const { code } = await runCli(['ext:outdated'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('ext:cleanup runs without error', async () => {
    const { code } = await runCli(['ext:cleanup'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('ext:add fails without a name argument', async () => {
    const { code, stderr } = await runCli(['ext:add'], { home: homeDir });
    assert.notEqual(code, 0, 'ext:add without name should fail');
    assert.ok(stderr.includes("missing required argument 'name'"));
  });

  it('ext:remove fails without a name argument', async () => {
    const { code, stderr } = await runCli(['ext:remove'], { home: homeDir });
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("missing required argument 'name'"));
  });
});

// ──────────────────────────────────────────────
// Test: vault commands
// ──────────────────────────────────────────────

describe('vault commands', () => {
  let homeDir;

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-test-vault-'));
  });

  after(async () => {
    await rm(homeDir, { recursive: true, force: true });
  });

  it('vault:list runs without error', async () => {
    const { code } = await runCli(['vault:list'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('vault:remove fails without a key argument', async () => {
    const { code, stderr } = await runCli(['vault:remove'], { home: homeDir });
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("missing required argument 'key'"));
  });
});

// ──────────────────────────────────────────────
// Test: registry commands
// ──────────────────────────────────────────────

describe('registry commands', () => {
  let homeDir;

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-test-reg-'));
  });

  after(async () => {
    await rm(homeDir, { recursive: true, force: true });
  });

  it('registry:list runs without error', async () => {
    const { code } = await runCli(['registry:list'], { home: homeDir });
    assert.equal(code, 0);
  });
});

// ──────────────────────────────────────────────
// Test: scheduler commands
// ──────────────────────────────────────────────

describe('scheduler commands', () => {
  let homeDir;

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-test-sched-'));
  });

  after(async () => {
    await rm(homeDir, { recursive: true, force: true });
  });

  it('scheduler:list runs without error', async () => {
    const { code } = await runCli(['scheduler:list'], { home: homeDir });
    assert.equal(code, 0);
  });

  it('scheduler:trigger fails without id argument', async () => {
    const { code, stderr } = await runCli(['scheduler:trigger'], { home: homeDir });
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("missing required argument 'id'"));
  });
});

// ──────────────────────────────────────────────
// Test: capabilities command
// ──────────────────────────────────────────────

describe('capabilities command', () => {
  it('fails when no project is found', async () => {
    await assertFailsWithoutProject('capabilities', 'renre-no-cap-');
  });
});

// ──────────────────────────────────────────────
// Test: ui command
// ──────────────────────────────────────────────

describe('ui command', () => {
  it('ui --help shows port and lan options', async () => {
    const { stdout, code } = await runCli(['ui', '--help']);
    assert.equal(code, 0);
    assert.ok(stdout.includes('--port'), 'Should show --port option');
    assert.ok(stdout.includes('--lan'), 'Should show --lan option');
    assert.ok(stdout.includes('--no-browser'), 'Should show --no-browser option');
    assert.ok(stdout.includes('--no-sleep'), 'Should show --no-sleep option');
  });
});
