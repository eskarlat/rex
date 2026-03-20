interface HookContext {
    projectDir: string;
    agentDir: string;
}
export declare function onInit(context: HookContext): void;
export declare function onDestroy(context: HookContext): void;
export {};
