import { createProgram } from './cli.js';

export const VERSION = '0.0.1';

const program = createProgram();
program.parseAsync(process.argv).catch((err: unknown) => {
  // eslint-disable-next-line no-console -- CLI entry point must report fatal errors to stderr
  console.error(err);
  process.exit(1);
});
