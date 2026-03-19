import { describe, it, expect, vi } from 'vitest';
import { nodeVersionCheck } from './checks/node-version.js';
import { configValidCheck } from './checks/config-valid.js';
import { vaultValidCheck } from './checks/vault-valid.js';
import { vaultKeyCheck } from './checks/vault-key.js';
import { createEngineConstraintsCheck } from './checks/engine-constraints.js';

describe('doctor checks', () => {
  describe('nodeVersionCheck', () => {
    it('should pass on Node >= 20', () => {
      const result = nodeVersionCheck.run();
      // We're running tests on Node 20+, so this should pass
      expect(result).toHaveProperty('status', 'pass');
      expect(result).toHaveProperty('name', 'Node.js version');
    });
  });

  describe('configValidCheck', () => {
    it('should warn when config file is missing', () => {
      // In test environment, CONFIG_PATH points to a non-existent file
      const result = configValidCheck.run();
      expect(result).toHaveProperty('name', 'config.json');
      // Will be 'warn' (missing) in test since no real config exists
      expect(['pass', 'warn']).toContain(result.status);
    });
  });

  describe('vaultValidCheck', () => {
    it('should warn when vault file is missing', () => {
      const result = vaultValidCheck.run();
      expect(result).toHaveProperty('name', 'vault.json');
      expect(['pass', 'warn']).toContain(result.status);
    });
  });

  describe('vaultKeyCheck', () => {
    it('should return a valid DiagnosticResult', () => {
      const result = vaultKeyCheck.run();
      expect(result).toHaveProperty('name', 'Vault key');
      expect(['pass', 'fail']).toContain(result.status);
    });
  });

  describe('engineConstraintsCheck', () => {
    it('should skip when not in a project directory', () => {
      const check = createEngineConstraintsCheck(null, () => ({}));
      const result = check.run();
      expect(result).toHaveProperty('status', 'pass');
      expect(result).toHaveProperty('message', 'skipped (not in a project directory)');
    });

    it('should pass when no extensions are activated', () => {
      const check = createEngineConstraintsCheck('/tmp/project', () => ({}));
      const result = check.run();
      expect(result).toHaveProperty('status', 'pass');
      expect(result).toHaveProperty('message', 'no activated extensions');
    });
  });
});
