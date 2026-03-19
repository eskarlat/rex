interface PanelProps {
    sdk?: {
        exec: {
            run(command: string, args?: Record<string, unknown>): Promise<{
                output: string;
                exitCode: number;
            }>;
        };
    };
    extensionName?: string;
}
export default function EchoMcpPanel({ sdk, extensionName }: PanelProps): import("react/jsx-runtime").JSX.Element;
export {};
