interface ExecutionContext {
    projectName: string;
    projectPath: string;
    args: Record<string, unknown>;
    config: Record<string, unknown>;
}
interface CommandResult {
    output: string;
    exitCode: number;
}
export default function greet(context: ExecutionContext): CommandResult;
export {};
