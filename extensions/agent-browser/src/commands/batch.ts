import { z, defineCommand } from '@renre-kit/extension-sdk/node';
import { spawn } from 'node:child_process';

import { getBinPath, getConfigFlags } from '../shared/command-helper.js';
import { toOutput, errorOutput } from '../shared/formatters.js';

function spawnWithStdin(bin: string, args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { timeout: 120_000 });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `Process exited with code ${String(code)}`));
    });
    child.on('error', reject);

    child.stdin.write(input);
    child.stdin.end();
  });
}

export default defineCommand({
  args: {
    commands: z.array(z.array(z.string())),
    bail: z.boolean().default(false),
  },
  handler: async (ctx) => {
    try {
      const bin = getBinPath();
      const configFlags = getConfigFlags(ctx.config);
      const batchArgs = [...configFlags, 'batch'];
      if (ctx.args.bail) batchArgs.push('--bail');

      const stdout = await spawnWithStdin(bin, batchArgs, JSON.stringify(ctx.args.commands));
      return toOutput(stdout.trim());
    } catch (err) {
      return errorOutput(err);
    }
  },
});
