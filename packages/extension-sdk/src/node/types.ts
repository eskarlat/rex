export interface HookContext {
  projectDir: string;
  agentDir: string;
  extensionDir: string;
  sdk: {
    deployAgentAssets: (extensionDir: string, projectDir: string, agentDirName?: string) => void;
    cleanupAgentAssets: (extensionDir: string, projectDir: string, agentDirName?: string) => void;
  };
}
