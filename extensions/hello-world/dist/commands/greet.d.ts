interface ExecutionContext {
    projectName: string;
    projectPath: string;
    args: Record<string, unknown>;
    config: Record<string, unknown>;
    logger?: {
        debug(message: string, data?: unknown): void;
        info(message: string, data?: unknown): void;
        warn(message: string, data?: unknown): void;
        error(message: string, data?: unknown): void;
    };
}
interface CommandResult {
    output: string;
    exitCode: number;
}
export default function greet(context: ExecutionContext): CommandResult;
export {};
