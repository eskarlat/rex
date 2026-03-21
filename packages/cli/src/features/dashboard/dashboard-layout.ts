import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

import type { DashboardLayout } from '../../core/types/dashboard.types.js';
import { PROJECT_DIR } from '../../core/paths/paths.js';

const LAYOUT_FILENAME = 'dashboard-layout.json';

const EMPTY_LAYOUT: DashboardLayout = { widgets: [] };

export function getDashboardLayout(projectPath: string): DashboardLayout {
  const filePath = join(projectPath, PROJECT_DIR, LAYOUT_FILENAME);
  if (!existsSync(filePath)) {
    return EMPTY_LAYOUT;
  }
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DashboardLayout;
  } catch {
    return EMPTY_LAYOUT;
  }
}

export function saveDashboardLayout(projectPath: string, layout: DashboardLayout): void {
  const filePath = join(projectPath, PROJECT_DIR, LAYOUT_FILENAME);
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(layout, null, 2));
}
