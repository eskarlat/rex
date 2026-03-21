import { existsSync, accessSync, constants } from 'node:fs';

import { GLOBAL_DIR } from '../../../core/paths/paths.js';
import type { DiagnosticCheck } from '../types.js';

export const globalDirectoryCheck: DiagnosticCheck = {
  name: 'Global directory',
  run: () => {
    if (!existsSync(GLOBAL_DIR)) {
      return {
        name: 'Global directory',
        status: 'fail',
        message: `${GLOBAL_DIR} does not exist`,
        detail: 'Run "renre-kit init" to create the global directory.',
      };
    }
    try {
      accessSync(GLOBAL_DIR, constants.W_OK);
    } catch {
      return {
        name: 'Global directory',
        status: 'fail',
        message: `${GLOBAL_DIR} is not writable`,
        detail: `Check permissions on ${GLOBAL_DIR}`,
      };
    }
    return {
      name: 'Global directory',
      status: 'pass',
      message: `${GLOBAL_DIR} exists and writable`,
    };
  },
};
