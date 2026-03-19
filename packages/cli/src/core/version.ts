/** Build-time injected version constants from package.json (ADR-005). */
declare const __CLI_VERSION__: string;
declare const __SDK_VERSION__: string;

export const CLI_VERSION = __CLI_VERSION__;
export const SDK_VERSION = __SDK_VERSION__;
