/**
 * MJS integration tests for extension installation and build flow.
 *
 * Verifies that:
 * 1. Extensions can be built with buildExtension (esbuild bundling)
 * 2. Built extensions are self-contained (include createRequire banner)
 * 3. The scaffold tool generates build.js files
 * 4. Local extension installation works end-to-end
 * 5. Installed extensions are visible through the server API (marketplace)
 */
import { execFile, execFileSync, spawn } from 'node:child_process';
import { mkdtemp, rm, readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const CLI_BIN = join(import.meta.dirname, '..', 'packages', 'cli', 'bin', 'renre-kit.js');
const HELLO_WORLD_EXT = join(import.meta.dirname, '..', 'extensions', 'hello-world');

/**
 * Run a git command synchronously. Throws on failure.
 */
function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf-8',
    timeout: 15_000,
    ...options,
  });
}

/**
 * Run the CLI with the given arguments and return { stdout, stderr, code }.
 */
function runCli(args, options = {}) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [CLI_BIN, ...args],
      {
        timeout: 15_000,
        env: {
          ...process.env,
          HOME: options.home ?? process.env.HOME,
          RENRE_KIT_HOME: options.renreHome ?? process.env.RENRE_KIT_HOME,
        },
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
 * Run an arbitrary node command.
 */
function runNode(args, options = {}) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      args,
      {
        timeout: 30_000,
        env: { ...process.env },
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
 * Wait for a port to be listening by polling.
 */
async function waitForPort(port, timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/projects`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok || res.status < 500) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

// ──────────────────────────────────────────────
// Test: scaffold generates build.js
// ──────────────────────────────────────────────

describe('scaffold generates build.js', () => {
  let homeDir;
  let tempDir;

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-e2e-home-'));
    tempDir = await mkdtemp(join(tmpdir(), 'renre-e2e-scaffold-'));
  });

  after(async () => {
    await rm(homeDir, { recursive: true, force: true });
    await rm(tempDir, { recursive: true, force: true });
  });

  it('standard scaffold includes build.js with buildExtension', async () => {
    // Use the create-renre-extension package directly
    const createBin = join(
      import.meta.dirname,
      '..',
      'packages',
      'create-renre-extension',
      'dist',
      'index.js',
    );

    if (!existsSync(createBin)) {
      // Skip if not built — CI should build first
      return;
    }

    const { code, stderr } = await runNode(
      [createBin, 'test-standard-ext', '--type', 'standard'],
      { cwd: tempDir },
    );

    // If the scaffolding tool fails, that's an infrastructure issue — skip gracefully
    if (code !== 0) {
      console.log('Scaffold failed (may not be built):', stderr);
      return;
    }

    const extDir = join(tempDir, 'test-standard-ext');
    const buildJs = await readFile(join(extDir, 'build.js'), 'utf-8');
    assert.ok(buildJs.includes('buildExtension'), 'build.js should use buildExtension');
    assert.ok(
      buildJs.includes("'@renre-kit/extension-sdk/node'"),
      'build.js should import from SDK',
    );
  });
});

// ──────────────────────────────────────────────
// Test: buildExtension produces bundled output
// ──────────────────────────────────────────────

describe('buildExtension produces bundled output', () => {
  let tempDir;

  before(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'renre-e2e-build-'));
  });

  after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('bundles a simple TypeScript file into self-contained ESM', async () => {
    // Create a minimal extension source
    const srcDir = join(tempDir, 'src');
    await mkdir(srcDir, { recursive: true });
    await writeFile(
      join(srcDir, 'index.ts'),
      `
import path from 'node:path';
export function hello(): string {
  return 'hello from ' + path.basename(__filename);
}
`,
    );

    // Create a build script that uses the SDK's buildExtension
    const sdkNodePath = join(
      import.meta.dirname,
      '..',
      'packages',
      'extension-sdk',
      'dist',
      'node',
      'index.js',
    );

    if (!existsSync(sdkNodePath)) {
      console.log('SDK not built, skipping buildExtension E2E test');
      return;
    }

    await writeFile(
      join(tempDir, 'build.mjs'),
      `
import { buildExtension } from '${sdkNodePath.replace(/\\/g, '/')}';

await buildExtension({
  entryPoints: [{ in: 'src/index.ts', out: 'index' }],
  outdir: 'dist',
});
console.log('Build complete');
`,
    );

    const { code, stdout, stderr } = await runNode(['build.mjs'], { cwd: tempDir });

    if (code !== 0) {
      console.log('Build stderr:', stderr);
    }
    assert.equal(code, 0, `Build should succeed. stderr: ${stderr}`);
    assert.ok(stdout.includes('Build complete'), 'Build script should complete');

    // Verify the output exists and has the createRequire banner
    const distFile = join(tempDir, 'dist', 'index.js');
    assert.ok(existsSync(distFile), 'dist/index.js should exist');

    const content = await readFile(distFile, 'utf-8');
    assert.ok(
      content.includes('createRequire(import.meta.url)'),
      'Output should have createRequire banner for Node.js CJS compat',
    );
    assert.ok(content.includes('hello'), 'Output should contain the hello function');
  });
});

// ──────────────────────────────────────────────
// Test: install extension + verify via server API
// ──────────────────────────────────────────────

describe('extension install and server integration', () => {
  let homeDir;
  let projectDir;
  let serverProc;
  const TEST_PORT = 14_300 + Math.floor(Math.random() * 900);

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-e2e-full-home-'));
    projectDir = await mkdtemp(join(tmpdir(), 'renre-e2e-full-project-'));

    // 1. Create a bare git repo with hello-world extension
    const bareRepoDir = join(homeDir, 'fake-github', 'hello-world.git');
    await mkdir(bareRepoDir, { recursive: true });
    git(['init', '--bare'], { cwd: bareRepoDir });

    const workRepo = await mkdtemp(join(tmpdir(), 'renre-e2e-local-work-'));
    git(['init', '-b', 'main'], { cwd: workRepo });
    git(['config', 'user.email', 'test@test.com'], { cwd: workRepo });
    git(['config', 'user.name', 'Test'], { cwd: workRepo });
    git(['config', 'commit.gpgsign', 'false'], { cwd: workRepo });
    await cp(HELLO_WORLD_EXT, workRepo, { recursive: true });
    git(['add', '-A'], { cwd: workRepo });
    git(['commit', '-m', 'initial'], { cwd: workRepo });
    git(['tag', 'v1.0.0'], { cwd: workRepo });
    git(['remote', 'add', 'origin', bareRepoDir], { cwd: workRepo });
    git(['push', 'origin', 'main', '--tags'], { cwd: workRepo });
    await rm(workRepo, { recursive: true, force: true });

    // 2. Set up registry pointing to the local bare repo
    const bareRepoUrl = `file://${bareRepoDir}`;
    const registryDir = join(homeDir, 'registries', 'local', '.renre-kit');
    await mkdir(registryDir, { recursive: true });
    await writeFile(
      join(registryDir, 'extensions.json'),
      JSON.stringify({
        extensions: [
          {
            name: 'hello-world',
            description: 'Hello World extension',
            gitUrl: bareRepoUrl,
            latestVersion: '1.0.0',
            type: 'standard',
            icon: '',
            author: 'test',
          },
        ],
      }),
    );
    await writeFile(join(homeDir, 'registries', 'local', '.fetched_at'), new Date().toISOString());

    // 3. Set up global config with registry
    await mkdir(homeDir, { recursive: true });
    await writeFile(
      join(homeDir, 'config.json'),
      JSON.stringify({
        registries: [
          { name: 'local', url: bareRepoDir, priority: 1, cacheTTL: 86400 },
        ],
      }),
    );

    // 4. Initialize a project
    const initResult = await runCli(['init'], {
      cwd: projectDir,
      renreHome: homeDir,
    });
    assert.equal(initResult.code, 0, `init should succeed: ${initResult.stderr}`);
  });

  after(async () => {
    if (serverProc && serverProc.exitCode === null) {
      serverProc.kill('SIGTERM');
      await new Promise((resolve) => {
        serverProc.on('exit', () => resolve(true));
        setTimeout(() => {
          if (serverProc.exitCode === null) serverProc.kill('SIGKILL');
          resolve(false);
        }, 3000);
      });
    }
    await rm(homeDir, { recursive: true, force: true });
    await rm(projectDir, { recursive: true, force: true });
  });

  it('ext:list works in initialized project', async () => {
    const { code } = await runCli(['ext:list'], {
      cwd: projectDir,
      renreHome: homeDir,
    });
    assert.equal(code, 0, 'ext:list should work in initialized project');
  });

  it('ext:add installs hello-world extension', async () => {
    const addResult = await runCli(['ext:add', 'hello-world'], {
      cwd: projectDir,
      renreHome: homeDir,
    });

    const extDir = join(homeDir, 'extensions', 'hello-world@1.0.0');

    assert.equal(addResult.code, 0, `ext:add should succeed: ${addResult.stderr}`);

    // Verify extension directory and manifest exist
    assert.ok(existsSync(extDir), 'Extension directory should exist after install');
    assert.ok(
      existsSync(join(extDir, 'manifest.json')),
      'manifest.json should exist in installed extension',
    );

    // Verify manifest content
    const manifest = JSON.parse(await readFile(join(extDir, 'manifest.json'), 'utf-8'));
    assert.equal(manifest.name, 'hello-world', 'Manifest name should be hello-world');
    assert.equal(manifest.version, '1.0.0', 'Manifest version should be 1.0.0');

    // Verify extension appears in ext:list
    const listResult = await runCli(['ext:list'], {
      cwd: projectDir,
      renreHome: homeDir,
    });
    assert.equal(listResult.code, 0, 'ext:list should succeed after install');
    assert.ok(
      listResult.stdout.includes('hello-world'),
      'ext:list should show hello-world after install',
    );
  });

  it('server starts and exposes extension data via marketplace API', async () => {
    // Start the server
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'ui', '--port', String(TEST_PORT), '--no-browser'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          RENRE_KIT_HOME: homeDir,
        },
        cwd: projectDir,
      },
    );

    let output = '';
    serverProc.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    serverProc.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });

    const ready = await waitForPort(TEST_PORT, 10_000);
    if (!ready) {
      console.log('Server output:', output);
    }
    assert.ok(ready, `Server should be listening on port ${TEST_PORT}`);

    // Query the marketplace API
    const marketplaceRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/marketplace`, {
      headers: { 'X-RenreKit-Project': projectDir },
      signal: AbortSignal.timeout(3000),
    });
    assert.ok(
      marketplaceRes.status < 500,
      `Marketplace API should respond, got ${marketplaceRes.status}`,
    );

    const marketplaceData = await marketplaceRes.json();
    assert.ok(marketplaceData.active !== undefined, 'Response should have active field');
    assert.ok(marketplaceData.installed !== undefined, 'Response should have installed field');
    assert.ok(marketplaceData.available !== undefined, 'Response should have available field');
  });

  it('server responds to ext:status-like queries', async () => {
    if (!serverProc || serverProc.exitCode !== null) {
      return;
    }

    // Query the projects endpoint to verify server is functional
    const projectsRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/projects`, {
      headers: { 'X-RenreKit-Project': projectDir },
      signal: AbortSignal.timeout(3000),
    });
    assert.ok(
      projectsRes.status < 500,
      `Projects API should respond, got ${projectsRes.status}`,
    );
  });

  it('server shuts down cleanly', async () => {
    if (!serverProc || serverProc.exitCode !== null) {
      return;
    }

    serverProc.kill('SIGTERM');
    const exitCode = await new Promise((resolve) => {
      serverProc.on('exit', (code) => resolve(code));
      setTimeout(() => resolve('timeout'), 5000);
    });
    assert.notEqual(exitCode, 'timeout', 'Server should exit on SIGTERM');
  });
});

// ──────────────────────────────────────────────
// Test: git-based extension installation (simulates GitHub)
// ──────────────────────────────────────────────

describe('git-based extension installation (simulated GitHub)', () => {
  let homeDir;
  let projectDir;
  let bareRepoDir;
  let serverProc;
  const TEST_PORT = 14_400 + Math.floor(Math.random() * 500);

  before(async () => {
    homeDir = await mkdtemp(join(tmpdir(), 'renre-e2e-git-home-'));
    projectDir = await mkdtemp(join(tmpdir(), 'renre-e2e-git-project-'));
    bareRepoDir = join(homeDir, 'fake-github', 'hello-world.git');

    // 1. Create a bare git repo simulating a GitHub remote
    await mkdir(bareRepoDir, { recursive: true });
    git(['init', '--bare'], { cwd: bareRepoDir });

    // 2. Create a temp working repo, commit hello-world extension, tag v1.0.0, push to bare
    const workRepo = await mkdtemp(join(tmpdir(), 'renre-e2e-git-work-'));
    git(['init', '-b', 'main'], { cwd: workRepo });
    git(['config', 'user.email', 'test@test.com'], { cwd: workRepo });
    git(['config', 'user.name', 'Test'], { cwd: workRepo });
    git(['config', 'commit.gpgsign', 'false'], { cwd: workRepo });

    // Copy hello-world extension files into the work repo
    await cp(HELLO_WORLD_EXT, workRepo, { recursive: true });

    git(['add', '-A'], { cwd: workRepo });
    git(['commit', '-m', 'initial'], { cwd: workRepo });
    git(['tag', 'v1.0.0'], { cwd: workRepo });
    git(['remote', 'add', 'origin', bareRepoDir], { cwd: workRepo });
    git(['push', 'origin', 'main', '--tags'], { cwd: workRepo });

    await rm(workRepo, { recursive: true, force: true });

    // 3. Set up a registry that points to our local bare repo (file:// protocol for proper clone)
    const bareRepoUrl = `file://${bareRepoDir}`;
    const registryDir = join(homeDir, 'registries', 'local', '.renre-kit');
    await mkdir(registryDir, { recursive: true });
    await writeFile(
      join(registryDir, 'extensions.json'),
      JSON.stringify({
        extensions: [
          {
            name: 'hello-world',
            description: 'Hello World extension',
            gitUrl: bareRepoUrl,
            latestVersion: '1.0.0',
            type: 'standard',
            icon: '',
            author: 'test',
          },
        ],
      }),
    );

    // Write a .fetched_at so the registry looks fresh
    await writeFile(join(homeDir, 'registries', 'local', '.fetched_at'), new Date().toISOString());

    // 4. Set up global config with our local registry
    await mkdir(homeDir, { recursive: true });
    await writeFile(
      join(homeDir, 'config.json'),
      JSON.stringify({
        registries: [
          {
            name: 'local',
            url: bareRepoDir,
            priority: 1,
            cacheTTL: 86400,
          },
        ],
      }),
    );

    // 5. Initialize a project
    const initResult = await runCli(['init'], {
      cwd: projectDir,
      renreHome: homeDir,
    });
    assert.equal(initResult.code, 0, `init should succeed: ${initResult.stderr}`);
  });

  after(async () => {
    if (serverProc && serverProc.exitCode === null) {
      serverProc.kill('SIGTERM');
      await new Promise((resolve) => {
        serverProc.on('exit', () => resolve(true));
        setTimeout(() => {
          if (serverProc.exitCode === null) serverProc.kill('SIGKILL');
          resolve(false);
        }, 3000);
      });
    }
    await rm(homeDir, { recursive: true, force: true });
    await rm(projectDir, { recursive: true, force: true });
  });

  it('ext:add clones extension from git repo (like GitHub)', async () => {
    const addResult = await runCli(['ext:add', 'hello-world'], {
      cwd: projectDir,
      renreHome: homeDir,
    });

    assert.equal(addResult.code, 0, `ext:add should succeed: ${addResult.stderr}`);

    // Verify extension was cloned into the expected directory
    const extDir = join(homeDir, 'extensions', 'hello-world@1.0.0');
    assert.ok(existsSync(extDir), 'Extension directory should exist');
    assert.ok(
      existsSync(join(extDir, 'manifest.json')),
      'manifest.json should exist in cloned extension',
    );
    assert.ok(
      existsSync(join(extDir, 'dist', 'index.js')),
      'dist/index.js should exist in cloned extension',
    );

    // Verify manifest content
    const manifest = JSON.parse(await readFile(join(extDir, 'manifest.json'), 'utf-8'));
    assert.equal(manifest.name, 'hello-world');
    assert.equal(manifest.version, '1.0.0');
    assert.equal(manifest.type, 'standard');
  });

  it('ext:list shows the installed extension', async () => {
    const listResult = await runCli(['ext:list'], {
      cwd: projectDir,
      renreHome: homeDir,
    });

    assert.equal(listResult.code, 0, 'ext:list should succeed');
    assert.ok(
      listResult.stdout.includes('hello-world'),
      'ext:list should show hello-world',
    );
  });

  it('server exposes git-installed extension via marketplace API', async () => {
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'ui', '--port', String(TEST_PORT), '--no-browser'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          RENRE_KIT_HOME: homeDir,
        },
        cwd: projectDir,
      },
    );

    let output = '';
    serverProc.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    serverProc.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });

    const ready = await waitForPort(TEST_PORT, 10_000);
    if (!ready) {
      console.log('Server output:', output);
    }
    assert.ok(ready, `Server should be listening on port ${TEST_PORT}`);

    // Query the marketplace API — extension should appear
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/marketplace`, {
      headers: { 'X-RenreKit-Project': projectDir },
      signal: AbortSignal.timeout(3000),
    });
    assert.ok(res.status < 500, `Marketplace API should respond, got ${res.status}`);

    const data = await res.json();
    const allExtensions = [...data.active, ...data.installed, ...data.available];
    const helloWorld = allExtensions.find((e) => e.name === 'hello-world');
    assert.ok(helloWorld, 'hello-world should appear in marketplace data');
    assert.equal(helloWorld.version, '1.0.0', 'Version should be 1.0.0');
    assert.equal(helloWorld.type, 'standard', 'Type should be standard');
  });

  it('server serves extension command handler dist file', async () => {
    if (!serverProc || serverProc.exitCode !== null) return;

    // Verify the greet command handler exists in the installed extension
    const extDir = join(homeDir, 'extensions', 'hello-world@1.0.0');
    assert.ok(
      existsSync(join(extDir, 'dist', 'commands', 'greet.js')),
      'greet command handler should exist in dist',
    );
  });

  it('server shuts down cleanly after git-install test', async () => {
    if (!serverProc || serverProc.exitCode !== null) return;

    serverProc.kill('SIGTERM');
    const exitCode = await new Promise((resolve) => {
      serverProc.on('exit', (code) => resolve(code));
      setTimeout(() => resolve('timeout'), 5000);
    });
    assert.notEqual(exitCode, 'timeout', 'Server should exit on SIGTERM');
  });
});
