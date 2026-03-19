import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getDashboardLayout, saveDashboardLayout } from './dashboard-layout.js';
import type { DashboardLayout } from '../../core/types/dashboard.types.js';

describe('dashboard-layout', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'renre-kit-dashboard-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const sampleLayout: DashboardLayout = {
    widgets: [
      {
        id: 'hello-world:status-widget',
        extensionName: 'hello-world',
        widgetId: 'status-widget',
        position: { x: 0, y: 0 },
        size: { w: 4, h: 2 },
      },
    ],
  };

  describe('getDashboardLayout', () => {
    it('returns empty layout when file does not exist', () => {
      const layout = getDashboardLayout(tempDir);
      expect(layout).toEqual({ widgets: [] });
    });

    it('reads and returns layout from file', () => {
      mkdirSync(join(tempDir, '.renre-kit'), { recursive: true });
      writeFileSync(
        join(tempDir, '.renre-kit', 'dashboard-layout.json'),
        JSON.stringify(sampleLayout, null, 2),
      );
      const layout = getDashboardLayout(tempDir);
      expect(layout.widgets).toHaveLength(1);
      expect(layout.widgets[0]?.id).toBe('hello-world:status-widget');
      expect(layout.widgets[0]?.size).toEqual({ w: 4, h: 2 });
    });

    it('handles malformed JSON gracefully (returns empty)', () => {
      mkdirSync(join(tempDir, '.renre-kit'), { recursive: true });
      writeFileSync(
        join(tempDir, '.renre-kit', 'dashboard-layout.json'),
        '{ broken json }',
      );
      const layout = getDashboardLayout(tempDir);
      expect(layout).toEqual({ widgets: [] });
    });
  });

  describe('saveDashboardLayout', () => {
    it('saves layout to file', () => {
      saveDashboardLayout(tempDir, sampleLayout);
      const raw = readFileSync(
        join(tempDir, '.renre-kit', 'dashboard-layout.json'),
        'utf-8',
      );
      const saved = JSON.parse(raw) as DashboardLayout;
      expect(saved.widgets).toHaveLength(1);
      expect(saved.widgets[0]?.id).toBe('hello-world:status-widget');
    });

    it('creates .renre-kit dir if missing', () => {
      saveDashboardLayout(tempDir, sampleLayout);
      const raw = readFileSync(
        join(tempDir, '.renre-kit', 'dashboard-layout.json'),
        'utf-8',
      );
      expect(JSON.parse(raw)).toEqual(sampleLayout);
    });

    it('overwrites existing layout', () => {
      saveDashboardLayout(tempDir, sampleLayout);
      const updatedLayout: DashboardLayout = { widgets: [] };
      saveDashboardLayout(tempDir, updatedLayout);
      const raw = readFileSync(
        join(tempDir, '.renre-kit', 'dashboard-layout.json'),
        'utf-8',
      );
      expect(JSON.parse(raw)).toEqual({ widgets: [] });
    });
  });
});
