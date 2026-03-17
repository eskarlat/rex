import * as clack from '@clack/prompts';

interface ExtRestartOptions {
  name: string;
  restartFn: (name: string) => Promise<unknown>;
}

export async function handleExtRestart(options: ExtRestartOptions): Promise<void> {
  const s = clack.spinner();
  s.start(`Restarting ${options.name}...`);

  try {
    await options.restartFn(options.name);
    s.stop(`Restarted ${options.name}`);
    clack.log.success(`${options.name} restarted successfully.`);
  } catch (err) {
    s.stop(`Failed to restart ${options.name}`);
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to restart ${options.name}: ${message}`);
  }
}
