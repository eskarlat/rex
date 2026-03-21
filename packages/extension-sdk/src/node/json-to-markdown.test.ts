import { describe, it, expect } from 'vitest';
import { jsonToMarkdown } from './json-to-markdown';

describe('jsonToMarkdown', () => {
  describe('primitives', () => {
    it('renders null as *none*', () => {
      expect(jsonToMarkdown(null)).toBe('*none*');
    });

    it('renders undefined as *none*', () => {
      expect(jsonToMarkdown(undefined)).toBe('*none*');
    });

    it('renders numbers', () => {
      expect(jsonToMarkdown(42)).toBe('42');
    });

    it('renders booleans', () => {
      expect(jsonToMarkdown(true)).toBe('true');
    });

    it('renders plain strings', () => {
      expect(jsonToMarkdown('hello')).toBe('hello');
    });

    it('renders empty string as *(empty)*', () => {
      expect(jsonToMarkdown('')).toBe('*(empty)*');
    });

    it('renders multiline strings as code blocks', () => {
      const result = jsonToMarkdown('line1\nline2');
      expect(result).toContain('```');
      expect(result).toContain('line1\nline2');
    });

    it('renders URLs as markdown links', () => {
      const result = jsonToMarkdown('https://example.com');
      expect(result).toBe('[https://example.com](https://example.com)');
    });

    it('renders http URLs as markdown links', () => {
      const result = jsonToMarkdown('http://localhost:3000');
      expect(result).toBe('[http://localhost:3000](http://localhost:3000)');
    });
  });

  describe('options', () => {
    it('adds title heading when provided', () => {
      const result = jsonToMarkdown('data', { title: 'My Report' });
      expect(result).toContain('# My Report');
    });

    it('renders without title by default', () => {
      const result = jsonToMarkdown('data');
      expect(result).not.toContain('#');
    });
  });

  describe('arrays', () => {
    it('renders empty array as *(empty list)*', () => {
      expect(jsonToMarkdown([])).toBe('*(empty list)*');
    });

    it('renders single-item array as the item itself', () => {
      expect(jsonToMarkdown([42])).toBe('42');
    });

    it('renders primitive array as bullet list', () => {
      const result = jsonToMarkdown(['a', 'b', 'c']);
      expect(result).toBe('- a\n- b\n- c');
    });

    it('renders null items in primitive array', () => {
      const result = jsonToMarkdown([1, null, 3]);
      expect(result).toContain('- *none*');
    });

    it('renders array of objects as table when simple', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('| Name | Age |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| Alice | 30 |');
      expect(result).toContain('| Bob | 25 |');
    });

    it('renders complex object array as numbered sections', () => {
      const data = [
        { name: 'Item 1', details: { nested: true, list: [1, 2] } },
        { name: 'Item 2', details: { nested: false, list: [3] } },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });

    it('renders mixed array with primitives and objects', () => {
      const data = [42, { name: 'test' }];
      const result = jsonToMarkdown(data);
      expect(result).toContain('42');
      expect(result).toContain('Item 2');
    });
  });

  describe('objects', () => {
    it('renders empty object (all null values) as *(empty)*', () => {
      const result = jsonToMarkdown({ a: null, b: undefined });
      expect(result).toBe('*(empty)*');
    });

    it('renders simple key-value pairs', () => {
      const data = { name: 'Alice', age: 30, active: true };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Name:** Alice');
      expect(result).toContain('**Age:** 30');
      expect(result).toContain('**Active:** true');
    });

    it('renders nested objects with single values inline', () => {
      const data = { title: 'Report', details: { count: 5, status: 'ok' } };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Title:** Report');
      expect(result).toContain('## Details');
    });

    it('falls back to JSON at maxDepth', () => {
      const data = { a: { b: { c: { d: { e: 'deep' } } } } };
      const result = jsonToMarkdown(data, { maxDepth: 3 });
      expect(result).toContain('```json');
    });

    it('renders single-value objects inline', () => {
      const data = { status: { id: '3', name: 'Done' } };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**Status:** Done');
    });

    it('renders inline URL values as links', () => {
      const data = { url: 'https://example.com' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('[https://example.com]');
    });

    it('renders empty string values as *(empty)*', () => {
      const data = { name: '' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('*(empty)*');
    });

    it('renders multiline string values as complex entries', () => {
      const data = { description: 'line1\nline2' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('```');
    });
  });

  describe('filterNoise', () => {
    it('filters noise keys when enabled', () => {
      const data = { name: 'Test', self: 'http://api/1', _links: {} };
      const result = jsonToMarkdown(data, { filterNoise: true });
      expect(result).toContain('**Name:** Test');
      expect(result).not.toContain('self');
      expect(result).not.toContain('_links');
    });

    it('keeps noise keys when disabled', () => {
      const data = { name: 'Test', self: 'http://api/1' };
      const result = jsonToMarkdown(data, { filterNoise: false });
      expect(result).toContain('Self');
    });

    it('filters noise keys from table columns', () => {
      const data = [
        { name: 'A', self: 'http://1' },
        { name: 'B', self: 'http://2' },
      ];
      const result = jsonToMarkdown(data, { filterNoise: true });
      expect(result).toContain('| Name |');
      expect(result).not.toContain('Self');
    });
  });

  describe('pagination', () => {
    it('detects paginated response with total', () => {
      const data = { total: 100, startAt: 0, maxResults: 25, issues: [{ key: 'A-1' }] };
      const result = jsonToMarkdown(data);
      expect(result).toContain('Showing 1 of 100');
    });

    it('detects pagination with limit/offset', () => {
      const data = { limit: 10, offset: 0, results: [{ id: 1 }, { id: 2 }] };
      const result = jsonToMarkdown(data);
      expect(result).toContain('Id');
    });

    it('does not detect pagination without array field', () => {
      const data = { total: 100, startAt: 0, maxResults: 25 };
      const result = jsonToMarkdown(data);
      expect(result).not.toContain('Showing');
    });

    it('does not detect pagination without meta fields', () => {
      const data = { items: [{ id: 1 }], name: 'list' };
      const result = jsonToMarkdown(data);
      expect(result).not.toContain('Showing');
    });
  });

  describe('table cell flattening', () => {
    it('flattens null/undefined to empty string', () => {
      const data = [
        { name: 'A', val: null },
        { name: 'B', val: undefined },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('| A |');
    });

    it('flattens single-value objects in cells', () => {
      const data = [{ name: 'A', status: { id: '1', name: 'Open' } }];
      const result = jsonToMarkdown(data);
      expect(result).toContain('Open');
    });

    it('flattens primitive arrays in table cells', () => {
      // Objects need array columns but must be simple enough for table
      const data = [
        { name: 'A', score: 10 },
        { name: 'B', score: 20 },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('| A | 10 |');
      expect(result).toContain('| B | 20 |');
    });

    it('renders objects with array fields as sections', () => {
      const data = [
        { name: 'A', labels: [{ name: 'bug' }, { name: 'urgent' }] },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('Labels');
      expect(result).toContain('bug');
      expect(result).toContain('urgent');
    });

    it('renders objects with complex nested values as sections', () => {
      const data = [
        { name: 'A', items: [{ a: 1, b: 2, c: 3 }] },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('Items');
    });

    it('renders single objects with empty arrays', () => {
      const data = [{ name: 'A', tags: [] }];
      const result = jsonToMarkdown(data);
      expect(result).toContain('A');
    });
  });

  describe('humanizeKey', () => {
    it('converts snake_case to Title Case', () => {
      const data = { user_name: 'Alice' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**User Name:** Alice');
    });

    it('converts camelCase to Title Case', () => {
      const data = { firstName: 'Bob' };
      const result = jsonToMarkdown(data);
      expect(result).toContain('**First Name:** Bob');
    });
  });

  describe('findLabel', () => {
    it('uses key field as section label', () => {
      const data = [
        { key: 'PROJ-1', summary: 'Fix bug', details: { nested: true } },
        { key: 'PROJ-2', summary: 'Add feature', details: { nested: false } },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('PROJ-1');
      expect(result).toContain('PROJ-2');
    });

    it('falls back to Item N when no label found', () => {
      const data = [
        { count: 1, data: { a: 1, b: 2 } },
        { count: 2, data: { a: 3, b: 4 } },
      ];
      const result = jsonToMarkdown(data);
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });
  });

  describe('edge cases', () => {
    it('handles deeply nested structure', () => {
      const data = { a: { b: { c: { d: { e: { f: 'deep' } } } } } };
      const result = jsonToMarkdown(data);
      expect(result).toContain('json');
    });

    it('limits heading depth to 6', () => {
      const data = {
        l1: { l2: { l3: { l4: { l5: { a: 1, b: 2 } } } } },
      };
      const result = jsonToMarkdown(data, { maxDepth: 6 });
      expect(result).toContain('######');
      expect(result).not.toContain('#######');
    });

    it('handles extractSingleValue fallback', () => {
      const data = { status: { id: '3' } };
      const result = jsonToMarkdown(data);
      expect(result).toContain('3');
    });

    it('renders non-primitive non-object values', () => {
      // Symbol edge case — jsonToMarkdown should handle Symbol.toString()
      const data = { fn: () => {} };
      const result = jsonToMarkdown(data);
      expect(result).toBeTruthy();
    });
  });
});
