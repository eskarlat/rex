export type DiagnosticStatus = 'pass' | 'warn' | 'fail';

export interface DiagnosticResult {
  name: string;
  status: DiagnosticStatus;
  message: string;
  detail?: string;
}

export interface DiagnosticCheck {
  name: string;
  run: () => DiagnosticResult | Promise<DiagnosticResult>;
}
