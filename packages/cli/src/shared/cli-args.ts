/**
 * Converts kebab-case to camelCase. Leaves camelCase unchanged.
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Attempts to parse a string as JSON for object/array values.
 * Returns the original string for plain values or invalid JSON.
 */
function parseValue(value: string): unknown {
  if (
    (value.startsWith('{') && value.endsWith('}')) ||
    (value.startsWith('[') && value.endsWith(']'))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Parses raw CLI args (e.g. ["--query", "hello", "--libraryName", "react"])
 * into a Record (e.g. { query: "hello", libraryName: "react" }).
 *
 * Supports:
 * - --key value pairs
 * - --key=value syntax
 * - --boolean-flag (no value → true)
 * - kebab-case to camelCase conversion (--max-results → maxResults)
 * - JSON object/array value parsing
 *
 * Positional args go into _positional.
 */
export function parseCliArgs(argv: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const positional: string[] = [];

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = toCamelCase(arg.slice(2, eqIdx));
        result[key] = parseValue(arg.slice(eqIdx + 1));
        i += 1;
      } else {
        const key = toCamelCase(arg.slice(2));
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          result[key] = parseValue(next);
          i += 2;
        } else {
          result[key] = true;
          i += 1;
        }
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
