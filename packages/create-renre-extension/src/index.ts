import { scaffoldExtension } from './scaffold.js';

const args = process.argv.slice(2);
const name = args[0] ?? 'my-extension';
const typeFlag = args.indexOf('--type');
const type = typeFlag !== -1 && args[typeFlag + 1] === 'mcp' ? 'mcp' : 'standard';
const outputDir = process.cwd();

scaffoldExtension(name, type, outputDir)
  .then(() => {
    console.log(`\nExtension "${name}" created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${name}`);
    console.log(`  pnpm install`);
    console.log(`  pnpm build`);
  })
  .catch((err: unknown) => {
    console.error('Failed to create extension:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
