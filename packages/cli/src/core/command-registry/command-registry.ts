export type CommandHandler = (...args: unknown[]) => void | Promise<void>;

export interface CommandMetadata {
  description: string;
  usage: string;
}

interface RegisteredEntry {
  namespace: string;
  command: string;
  handler: CommandHandler;
  metadata: CommandMetadata;
}

export interface CommandInfo {
  namespace: string;
  command: string;
  metadata: CommandMetadata;
}

export class CommandRegistry {
  private commands = new Map<string, RegisteredEntry>();

  register(
    namespace: string,
    command: string,
    handler: CommandHandler,
    metadata: CommandMetadata,
  ): void {
    const key = this.makeKey(namespace, command);
    if (this.commands.has(key)) {
      throw new Error(`Command '${key}' is already registered`);
    }
    this.commands.set(key, { namespace, command, handler, metadata });
  }

  resolve(
    input: string,
  ): { handler: CommandHandler; metadata: CommandMetadata } | undefined {
    const colonIdx = input.indexOf(':');
    let key: string;
    if (colonIdx === -1) {
      key = this.makeKey('', input);
    } else {
      key = input;
    }

    const entry = this.commands.get(key);
    if (!entry) {
      return undefined;
    }
    return { handler: entry.handler, metadata: entry.metadata };
  }

  list(): CommandInfo[] {
    return Array.from(this.commands.values()).map((e) => ({
      namespace: e.namespace,
      command: e.command,
      metadata: e.metadata,
    }));
  }

  suggest(input: string): string[] {
    const allKeys = Array.from(this.commands.keys());
    const threshold = 3;
    const results: Array<{ key: string; distance: number }> = [];

    for (const key of allKeys) {
      const dist = levenshtein(input, key);
      if (dist <= threshold) {
        results.push({ key, distance: dist });
      }
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.map((r) => r.key);
  }

  private makeKey(namespace: string, command: string): string {
    return namespace ? `${namespace}:${command}` : command;
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );

  for (let i = 0; i <= m; i++) {
    dp[i]![0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0]![j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }

  return dp[m]![n]!;
}
