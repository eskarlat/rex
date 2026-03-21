import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/greet.ts
function greet(context) {
  const positional = context.args._positional;
  const name = (typeof context.args.name === "string" ? context.args.name : void 0) ?? positional?.[0] ?? "World";
  const company = typeof context.config.companyName === "string" ? context.config.companyName : "RenreKit";
  context.logger?.info(`Greeting ${name} from ${company}`);
  return {
    output: `Hello, ${name}! Welcome from ${company}.`,
    exitCode: 0
  };
}
export {
  greet as default
};
