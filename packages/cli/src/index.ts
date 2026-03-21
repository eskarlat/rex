import { createProgram } from './cli.js';
import { initDatabase } from './core/database/database.js';
import { GLOBAL_DIR } from './core/paths/paths.js';
export { CLI_VERSION as VERSION } from './core/version.js';

initDatabase(GLOBAL_DIR);
const program = createProgram();
program.parseAsync(process.argv).catch((err: unknown) => {
   
  console.error(err);
  process.exit(1);
});
