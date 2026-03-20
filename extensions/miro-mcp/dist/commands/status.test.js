import { describe, it, expect } from 'vitest';
import status from './status.js';
describe('status command', () => {
    it('shows ready when token is set', () => {
        const result = status({
            projectName: 'test',
            projectPath: '/tmp/test',
            args: {},
            config: { accessToken: 'my-token' },
        });
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('miro-mcp v1.0.0');
        expect(result.output).toContain('Transport: stdio (MCP SDK)');
        expect(result.output).toContain('Access Token: (set)');
        expect(result.output).toContain('Toolsets: 21');
        expect(result.output).toContain('Total Tools: 98');
        expect(result.output).toContain('Status: ready');
    });
    it('shows configuration required when token is missing', () => {
        const result = status({
            projectName: 'test',
            projectPath: '/tmp/test',
            args: {},
            config: {},
        });
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Access Token: (not set)');
        expect(result.output).toContain('Status: configuration required');
    });
    it('treats empty string token as not set', () => {
        const result = status({
            projectName: 'test',
            projectPath: '/tmp/test',
            args: {},
            config: { accessToken: '' },
        });
        expect(result.output).toContain('Access Token: (not set)');
        expect(result.output).toContain('Status: configuration required');
    });
});
