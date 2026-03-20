import { describe, it, expect } from 'vitest';
import status from './status.js';
describe('context7-mcp:status', () => {
    const context = {
        projectName: 'test-project',
        projectPath: '/tmp/test',
        args: {},
        config: {},
    };
    it('returns exit code 0', () => {
        const result = status(context);
        expect(result.exitCode).toBe(0);
    });
    it('includes version info', () => {
        const result = status(context);
        expect(result.output).toContain('context7-mcp v1.0.0');
    });
    it('includes transport type', () => {
        const result = status(context);
        expect(result.output).toContain('stdio');
    });
    it('includes available tools', () => {
        const result = status(context);
        expect(result.output).toContain('resolve-library-id');
        expect(result.output).toContain('get-library-docs');
    });
});
