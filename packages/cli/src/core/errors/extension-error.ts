import { ErrorCode } from '../types/index.js';

export { ErrorCode };

export class ExtensionError extends Error {
  readonly extensionName: string;
  readonly code: ErrorCode;
  readonly originalError?: Error;

  constructor(extensionName: string, code: ErrorCode, message: string, originalError?: Error) {
    super(message);
    this.name = 'ExtensionError';
    this.extensionName = extensionName;
    this.code = code;
    this.originalError = originalError;
  }
}

export function wrapError(err: Error, extensionName: string, code: ErrorCode): ExtensionError {
  if (err instanceof ExtensionError && err.code === code && err.extensionName === extensionName) {
    return err;
  }

  const message = err instanceof Error ? err.message : String(err);

  return new ExtensionError(extensionName, code, message, err instanceof Error ? err : undefined);
}
