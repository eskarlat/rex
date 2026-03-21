import { describe, it, expect } from 'vitest';
import { jsonToMarkdown } from './json-to-markdown.js';

describe('jsonToMarkdown', () => {
  describe('primitives', () => {
    it('converts null to none marker', () => {
      expect(jsonToMarkdown(null)).toBe('*none*');
    });

    it('converts undefined to none marker', () => {
      expect(jsonToMarkdown(undefined)).toBe('*none*');
    });

    it('converts string to plain text', () => {
      expect(jsonToMarkdown('hello world')).toBe('hello world');
    });

    it('converts number to string', () => {
      expect(jsonToMarkdown(42)).toBe('42');
    });

    it('converts boolean to string', () => {
      expect(jsonToMarkdown(true)).toBe('true');
      expect(jsonToMarkdown(false)).toBe('false');
    });

    it('converts empty string to empty quoted marker', () => {
      expect(jsonToMarkdown('')).toBe('*(empty)*');
    });
  });

  describe('flat objects', () => {
    it('converts flat object to key-value list', () => {
      const result = jsonToMarkdown({ name: 'Alice', age: 30, active: true });
      expect(result).toContain('**Name:** Alice');
      expect(result).toContain('**Age:** 30');
      expect(result).toContain('**Active:** true');
    });

    it('converts empty object to none marker', () => {
      expect(jsonToMarkdown({})).toBe('*(empty)*');
    });

    it('humanizes camelCase keys', () => {
      const result = jsonToMarkdown({ issueKey: 'PROJ-123', displayName: 'John' });
      expect(result).toContain('**Issue Key:** PROJ-123');
      expect(result).toContain('**Display Name:** John');
    });

    it('humanizes snake_case keys', () => {
      const result = jsonToMarkdown({ issue_key: 'PROJ-123', max_results: 50 });
      expect(result).toContain('**Issue Key:** PROJ-123');
      expect(result).toContain('**Max Results:** 50');
    });
  });

  describe('nested objects', () => {
    it('renders nested object as subsection', () => {
      const data = {
        key: 'PROJ-123',
        fields: {
          summary: 'Fix login bug',
          status: { name: 'In Progress' },
        },
      };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Key:** PROJ-123');
      expect(result).toContain('## Fields');
      expect(result).toContain('**Summary:** Fix login bug');
      // status: { name: 'In Progress' } is a single-value object → flattened inline
      expect(result).toContain('**Status:** In Progress');
    });

    it('uses title option as top-level heading', () => {
      const result = jsonToMarkdown({ key: 'PROJ-123' }, { title: 'Jira Issue' });
      expect(result.startsWith('# Jira Issue\n')).toBe(true);
      expect(result).toContain('**Key:** PROJ-123');
    });
  });

  describe('arrays of primitives', () => {
    it('converts string array to bullet list', () => {
      const result = jsonToMarkdown(['alpha', 'beta', 'gamma']);
      expect(result).toContain('- alpha');
      expect(result).toContain('- beta');
      expect(result).toContain('- gamma');
    });

    it('converts number array to bullet list', () => {
      const result = jsonToMarkdown([1, 2, 3]);
      expect(result).toContain('- 1');
      expect(result).toContain('- 2');
      expect(result).toContain('- 3');
    });

    it('converts empty array to none marker', () => {
      expect(jsonToMarkdown([])).toBe('*(empty list)*');
    });
  });

  describe('arrays of objects (table rendering)', () => {
    it('renders uniform array of objects as a markdown table', () => {
      const data = [
        { key: 'PROJ-1', summary: 'Bug fix', status: 'Done' },
        { key: 'PROJ-2', summary: 'Feature', status: 'Open' },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('| Key | Summary | Status |');
      expect(result).toContain('| --- | --- | --- |');
      expect(result).toContain('| PROJ-1 | Bug fix | Done |');
      expect(result).toContain('| PROJ-2 | Feature | Open |');
    });

    it('handles missing fields in non-uniform arrays', () => {
      const data = [
        { key: 'PROJ-1', summary: 'Bug fix' },
        { key: 'PROJ-2', priority: 'High' },
      ];
      const result = jsonToMarkdown(data);
      // Should use union of all keys
      expect(result).toContain('Key');
      expect(result).toContain('Summary');
      expect(result).toContain('Priority');
    });

    it('flattens simple nested objects in table cells', () => {
      const data = [
        { key: 'PROJ-1', status: { name: 'Done' }, assignee: { displayName: 'Alice' } },
        { key: 'PROJ-2', status: { name: 'Open' }, assignee: { displayName: 'Bob' } },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('| PROJ-1 | Done | Alice |');
      expect(result).toContain('| PROJ-2 | Open | Bob |');
    });

    it('falls back to numbered sections for deeply nested arrays', () => {
      const data = [
        {
          key: 'PROJ-1',
          components: [
            { id: '1', name: 'Frontend' },
            { id: '2', name: 'Backend' },
          ],
        },
      ];
      const result = jsonToMarkdown(data);
      // Should still render but handle nested arrays gracefully
      expect(result).toContain('PROJ-1');
      expect(result).toContain('Frontend');
    });

    it('single-item array renders as object, not table', () => {
      const data = [{ key: 'PROJ-1', summary: 'Bug fix', status: 'Done' }];
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Key:** PROJ-1');
      expect(result).toContain('**Summary:** Bug fix');
    });
  });

  describe('pagination detection', () => {
    it('adds pagination summary for paginated responses', () => {
      const data = {
        issues: [
          { key: 'PROJ-1', summary: 'Bug' },
          { key: 'PROJ-2', summary: 'Feature' },
        ],
        startAt: 0,
        maxResults: 50,
        total: 127,
      };
      const result = jsonToMarkdown(data);
      expect(result).toContain('Showing 2 of 127');
      expect(result).toContain('PROJ-1');
      expect(result).toContain('PROJ-2');
    });

    it('detects offset/limit pagination style', () => {
      const data = {
        results: [{ id: '1', title: 'Page A' }],
        start: 0,
        limit: 25,
        size: 1,
      };
      const result = jsonToMarkdown(data);
      expect(result).toContain('Page A');
    });
  });

  describe('special value handling', () => {
    it('renders URLs as markdown links', () => {
      const data = { self: 'https://jira.example.com/rest/api/2/issue/10001' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('[https://jira.example.com/rest/api/2/issue/10001]');
    });

    it('renders multiline text in code block', () => {
      const data = { description: 'Line one\nLine two\nLine three' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('```');
      expect(result).toContain('Line one');
    });

    it('skips null values in objects', () => {
      const data = { key: 'PROJ-1', customField: null, summary: 'Test' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Key:** PROJ-1');
      expect(result).toContain('**Summary:** Test');
      expect(result).not.toContain('Custom Field');
    });
  });

  describe('depth limiting', () => {
    it('respects maxDepth option', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value',
            },
          },
        },
      };
      const result = jsonToMarkdown(data, { maxDepth: 2 });
      // At maxDepth, should render remaining as inline JSON
      expect(result).toContain('level4');
      expect(result).toContain('deep value');
    });
  });

  describe('noisy key filtering', () => {
    it('omits common API noise fields', () => {
      const data = {
        key: 'PROJ-123',
        summary: 'Fix bug',
        self: 'https://jira.example.com/rest/api/2/issue/10001',
        expand: 'renderedFields,names,schema',
        _links: { self: '/some/link' },
      };
      const result = jsonToMarkdown(data, { filterNoise: true });
      expect(result).toContain('**Key:** PROJ-123');
      expect(result).toContain('**Summary:** Fix bug');
      expect(result).not.toContain('**Expand:**');
      expect(result).not.toContain('**_links:**');
      // self URLs at top level are filtered
      expect(result).not.toContain('**Self:**');
    });
  });

  describe('real-world Jira response shape', () => {
    it('converts a typical Jira issue response', () => {
      const data = {
        key: 'PROJ-123',
        id: '10001',
        self: 'https://jira.example.com/rest/api/2/issue/10001',
        fields: {
          summary: 'Login page returns 500 error',
          status: { name: 'In Progress', id: '3' },
          priority: { name: 'High', id: '2' },
          assignee: { displayName: 'Alice Smith', emailAddress: 'alice@example.com' },
          reporter: { displayName: 'Bob Jones' },
          created: '2025-03-15T10:30:00.000+0000',
          updated: '2025-03-18T14:20:00.000+0000',
          labels: ['backend', 'critical'],
          components: [{ name: 'Auth Service' }],
        },
      };
      const result = jsonToMarkdown(data);
      expect(result).toContain('PROJ-123');
      expect(result).toContain('Login page returns 500 error');
      expect(result).toContain('In Progress');
      expect(result).toContain('High');
      expect(result).toContain('Alice Smith');
    });
  });

  describe('real-world Jira search response shape', () => {
    it('converts a typical Jira search response', () => {
      const data = {
        startAt: 0,
        maxResults: 50,
        total: 3,
        issues: [
          {
            key: 'PROJ-1',
            fields: {
              summary: 'Bug A',
              status: { name: 'Done' },
              priority: { name: 'Low' },
            },
          },
          {
            key: 'PROJ-2',
            fields: {
              summary: 'Bug B',
              status: { name: 'Open' },
              priority: { name: 'High' },
            },
          },
          {
            key: 'PROJ-3',
            fields: {
              summary: 'Feature C',
              status: { name: 'In Review' },
              priority: { name: 'Medium' },
            },
          },
        ],
      };
      const result = jsonToMarkdown(data);
      expect(result).toContain('Showing 3 of 3');
      expect(result).toContain('PROJ-1');
      expect(result).toContain('PROJ-2');
      expect(result).toContain('PROJ-3');
    });
  });
});
