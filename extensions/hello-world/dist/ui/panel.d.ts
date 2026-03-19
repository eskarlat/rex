import type { RenreKitSDK } from '@renre-kit/extension-sdk';
interface PanelProps {
    sdk?: RenreKitSDK;
    extensionName?: string;
    projectPath?: string | null;
}
export default function HelloWorldPanel({ sdk, extensionName }: PanelProps): import("react/jsx-runtime").JSX.Element;
export {};
