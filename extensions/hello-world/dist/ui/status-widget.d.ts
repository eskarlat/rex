import type { RenreKitSDK } from '@renre-kit/extension-sdk';
interface WidgetProps {
    sdk?: RenreKitSDK;
    extensionName?: string;
    projectPath?: string | null;
}
export default function StatusWidget({ sdk, extensionName }: WidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
