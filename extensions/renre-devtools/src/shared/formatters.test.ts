import { describe, it, expect } from 'vitest';
import {
  markdownTable,
  markdownCodeBlock,
  truncate,
  formatBytes,
  formatDuration,
  formatTimestamp,
} from './formatters.js';

describe('markdownTable', () => {
  it('creates a markdown table with headers and rows', () => {
    const result = markdownTable(['Name', 'Age'], [['Alice', '30'], ['Bob', '25']]);
    expect(result).toBe(
      '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |'
    );
  });

  it('handles empty rows', () => {
    const result = markdownTable(['A', 'B'], []);
    expect(result).toBe('| A | B |\n| --- | --- |');
  });

  it('handles single column', () => {
    const result = markdownTable(['Item'], [['one'], ['two']]);
    expect(result).toBe('| Item |\n| --- |\n| one |\n| two |');
  });
});

describe('markdownCodeBlock', () => {
  it('wraps content in fenced code block', () => {
    expect(markdownCodeBlock('hello')).toBe('```\nhello\n```');
  });

  it('includes language specifier', () => {
    expect(markdownCodeBlock('<div>hi</div>', 'html')).toBe(
      '```html\n<div>hi</div>\n```'
    );
  });

  it('handles empty content', () => {
    expect(markdownCodeBlock('')).toBe('```\n\n```');
  });
});

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles very short max length', () => {
    expect(truncate('hello world', 4)).toBe('h...');
  });
});

describe('formatBytes', () => {
  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500.0 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(150)).toBe('150ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(1500)).toBe('1.50s');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('formats exactly one second', () => {
    expect(formatDuration(1000)).toBe('1.00s');
  });
});

describe('formatTimestamp', () => {
  it('formats an ISO timestamp to locale time', () => {
    const result = formatTimestamp('2024-01-15T10:30:00.000Z');
    // The exact format depends on locale, but it should return a string
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
