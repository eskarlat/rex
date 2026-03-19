import type { DiagnosticCheck } from '../types.js';

export const nodeVersionCheck: DiagnosticCheck = {
  name: 'Node.js version',
  run: () => {
    const version = process.versions['node'] ?? '0.0.0';
    const major = parseInt(version.split('.')[0] ?? '0', 10);
    if (major >= 20) {
      return { name: 'Node.js version', status: 'pass', message: `v${version}` };
    }
    return {
      name: 'Node.js version',
      status: 'fail',
      message: `v${version} (requires >= 20.0.0)`,
      detail: 'Upgrade Node.js to version 20 or later.',
    };
  },
};
