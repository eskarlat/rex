import { describe, it, expect, vi } from 'vitest';
import { createToolRegistry } from './registry.js';
function createMockClient() {
  const handler = () => Promise.resolve({});
  return new Proxy(
    {},
    {
      get: () => vi.fn().mockImplementation(handler),
    },
  );
}
describe('createToolRegistry', () => {
  it('aggregates all 21 toolsets with 98 total tools', () => {
    const client = createMockClient();
    const registry = createToolRegistry(client);
    expect(registry.tools.length).toBe(98);
  });
  it('all tools have unique names', () => {
    const client = createMockClient();
    const registry = createToolRegistry(client);
    const names = registry.tools.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
  it('all tools have matching handlers', () => {
    const client = createMockClient();
    const registry = createToolRegistry(client);
    for (const tool of registry.tools) {
      expect(registry.handlers[tool.name]).toBeDefined();
    }
  });
  it('all tool names start with miro_', () => {
    const client = createMockClient();
    const registry = createToolRegistry(client);
    for (const tool of registry.tools) {
      expect(tool.name).toMatch(/^miro_/);
    }
  });
  it('handler count matches tool count', () => {
    const client = createMockClient();
    const registry = createToolRegistry(client);
    expect(Object.keys(registry.handlers).length).toBe(registry.tools.length);
  });
});
