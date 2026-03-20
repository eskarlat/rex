/**
 * Parses raw CLI args (e.g. ["--query", "hello", "--libraryName", "react"])
 * into a Record (e.g. { query: "hello", libraryName: "react" }).
 * Positional args go into _positional.
 */
export function parseCliArgs(argv: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const positional: string[] = [];

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        result[key] = next;
        i += 2;
      } else {
        result[key] = true;
        i += 1;
      }
    } else {
      positional.push(arg);
      i += 1;
    }
  }

  if (positional.length > 0) {
    result._positional = positional;
  }

  return result;
}
