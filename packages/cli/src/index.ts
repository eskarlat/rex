import { createProgram } from './cli.js';
import { initDatabase } from './core/database/database.js';
import { GLOBAL_DIR } from './core/paths/paths.js';

export const VERSION = '0.0.1';

initDatabase(GLOBAL_DIR);
const program = createProgram();
program.parseAsync(process.argv).catch((err: unknown) => {
  // eslint-disable-next-line no-console -- CLI entry point must report fatal errors to stderr
  console.error(err);
  process.exit(1);
});
