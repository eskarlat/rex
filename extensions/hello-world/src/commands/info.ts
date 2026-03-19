interface CommandResult {
  output: string;
  exitCode: number;
}

export default function info(): CommandResult {
  return {
    output: 'hello-world v1.0.0 — A simple hello world extension for RenreKit',
    exitCode: 0,
  };
}
