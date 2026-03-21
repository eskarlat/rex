export default function greet(context) {
    const positional = context.args._positional;
    const name = (typeof context.args.name === 'string' ? context.args.name : undefined) ??
        positional?.[0] ??
        'World';
    const company = typeof context.config.companyName === 'string' ? context.config.companyName : 'RenreKit';
    context.logger?.info(`Greeting ${name} from ${company}`);
    return {
        output: `Hello, ${name}! Welcome from ${company}.`,
        exitCode: 0,
    };
}
