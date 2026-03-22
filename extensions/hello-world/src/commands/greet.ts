import { z, defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  args: {
    _positional: z.array(z.string()).optional(),
    name: z.string().optional(),
  },
  handler: async (ctx) => {
    const name = ctx.args.name ?? ctx.args._positional?.[0] ?? 'World';

    const company =
      typeof ctx.config.companyName === 'string' ? ctx.config.companyName : 'RenreKit';

    ctx.logger?.info(`Greeting ${name} from ${company}`);

    return {
      output: `Hello, ${name}! Welcome from ${company}.`,
      exitCode: 0,
    };
  },
});
