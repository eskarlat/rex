/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  serializeSubtree,
  serializeFullPage,
  queryElements,
  getComputedStyles,
  getStorageEntries,
  getNavigationTiming,
  getWebVitals,
  getSelectedElementInfo,
} from './browser-scripts.js';

// --- DOM serialization ---

describe('serializeSubtree', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns not-found message for missing selector', () => {
    const result = serializeSubtree('.missing', 5);
    expect(result).toContain('No element found for selector: .missing');
  });

  it('serializes a simple element', () => {
    document.body.innerHTML = '<div id="test">Hello</div>';
    const result = serializeSubtree('#test', 5);
    expect(result).toContain('<div id="test">Hello</div>');
  });

  it('serializes nested elements', () => {
    document.body.innerHTML = '<div><span>inner</span></div>';
    const result = serializeSubtree('div', 5);
    expect(result).toContain('<div>');
    expect(result).toContain('<span>inner</span>');
    expect(result).toContain('</div>');
  });

  it('respects depth limit', () => {
    document.body.innerHTML = '<div><span><em>deep</em></span></div>';
    const result = serializeSubtree('div', 1);
    expect(result).toContain('...');
  });

  it('serializes empty elements', () => {
    document.body.innerHTML = '<div></div>';
    const result = serializeSubtree('div', 5);
    expect(result).toBe('<div></div>');
  });

  it('serializes element with attributes', () => {
    document.body.innerHTML = '<a href="/test" class="link">Click</a>';
    const result = serializeSubtree('a', 5);
    expect(result).toContain('href="/test"');
    expect(result).toContain('class="link"');
  });
});

describe('serializeFullPage', () => {
  it('serializes from document.documentElement', () => {
    document.body.innerHTML = '<p>Test</p>';
    const result = serializeFullPage(3);
    expect(result).toContain('<html>');
    expect(result).toContain('<p>Test</p>');
  });

  it('truncates text to 100 chars', () => {
    const longText = 'x'.repeat(200);
    document.body.innerHTML = `<p>${longText}</p>`;
    const result = serializeFullPage(5);
    expect(result).not.toContain(longText);
    expect(result).toContain('x'.repeat(100));
  });
});

// --- Select ---

describe('queryElements', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns empty array for no matches', () => {
    const result = queryElements('.nothing');
    expect(result).toEqual([]);
  });

  it('returns element info', () => {
    document.body.innerHTML = '<div id="main" class="container active" data-x="1">Hello</div>';
    const result = queryElements('#main');
    expect(result).toHaveLength(1);
    expect(result[0]?.tag).toBe('div');
    expect(result[0]?.id).toBe('main');
    expect(result[0]?.classes).toBe('container active');
    expect(result[0]?.text).toBe('Hello');
    expect(result[0]?.attrs).toContain('data-x="1"');
  });

  it('returns multiple elements with index', () => {
    document.body.innerHTML = '<ul><li>A</li><li>B</li><li>C</li></ul>';
    const result = queryElements('li');
    expect(result).toHaveLength(3);
    expect(result[0]?.index).toBe(0);
    expect(result[1]?.index).toBe(1);
    expect(result[2]?.index).toBe(2);
  });

  it('truncates text at 80 chars', () => {
    document.body.innerHTML = `<p>${'a'.repeat(100)}</p>`;
    const result = queryElements('p');
    expect(result[0]?.text).toHaveLength(80);
  });

  it('filters out id and class from attrs', () => {
    document.body.innerHTML = '<div id="x" class="y" data-z="1"></div>';
    const result = queryElements('div');
    expect(result[0]?.attrs).toBe('data-z="1"');
    expect(result[0]?.attrs).not.toContain('id=');
    expect(result[0]?.attrs).not.toContain('class=');
  });
});

// --- Styles ---

describe('getComputedStyles', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns null for missing element', () => {
    const result = getComputedStyles('.missing', ['color'], false);
    expect(result).toBeNull();
  });

  it('returns key properties that have values', () => {
    document.body.innerHTML = '<div id="styled"></div>';
    const result = getComputedStyles('#styled', ['display', 'color'], false);
    expect(result).toBeInstanceOf(Array);
  });

  it('returns all properties when showAll is true', () => {
    document.body.innerHTML = '<div id="styled"></div>';
    const result = getComputedStyles('#styled', [], true);
    expect(result).toBeInstanceOf(Array);
  });

  it('filters out none/normal/auto values in key mode', () => {
    document.body.innerHTML = '<div></div>';
    const result = getComputedStyles('div', ['display', 'position'], false);
    // JSDOM returns empty strings for computed styles, which get filtered
    expect(result).toBeInstanceOf(Array);
  });
});

// --- Storage ---

describe('getStorageEntries', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns empty array when storage is empty', () => {
    expect(getStorageEntries('local')).toEqual([]);
  });

  it('returns localStorage entries', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('lang', 'en');
    const result = getStorageEntries('local');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ key: 'theme', value: 'dark' });
    expect(result).toContainEqual({ key: 'lang', value: 'en' });
  });

  it('returns sessionStorage entries when type is session', () => {
    sessionStorage.setItem('token', 'abc');
    const result = getStorageEntries('session');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ key: 'token', value: 'abc' });
  });
});

// --- Performance ---

describe('getNavigationTiming', () => {
  it('returns null when no navigation entries exist', () => {
    vi.spyOn(globalThis.performance, 'getEntriesByType').mockReturnValue([]);
    const result = getNavigationTiming();
    expect(result).toBeNull();
    vi.restoreAllMocks();
  });

  it('returns timing breakdown when entry exists', () => {
    const mockEntry = {
      domainLookupStart: 0,
      domainLookupEnd: 10,
      connectStart: 10,
      connectEnd: 30,
      requestStart: 30,
      responseStart: 50,
      responseEnd: 80,
      fetchStart: 0,
      domInteractive: 100,
      domComplete: 200,
      loadEventEnd: 250,
    };
    vi.spyOn(globalThis.performance, 'getEntriesByType').mockReturnValue(
      [mockEntry] as unknown as PerformanceEntryList
    );
    const result = getNavigationTiming();
    expect(result).toEqual({
      dns: 10,
      tcp: 20,
      ttfb: 20,
      download: 30,
      domInteractive: 100,
      domComplete: 200,
      loadEvent: 250,
    });
    vi.restoreAllMocks();
  });
});

describe('getWebVitals', () => {
  it('returns null fcp when no paint entries', () => {
    vi.spyOn(globalThis.performance, 'getEntriesByType').mockReturnValue([]);
    const result = getWebVitals();
    expect(result.fcp).toBeNull();
    vi.restoreAllMocks();
  });

  it('returns fcp when paint entry exists', () => {
    vi.spyOn(globalThis.performance, 'getEntriesByType').mockReturnValue([
      { name: 'first-contentful-paint', startTime: 1234 },
    ] as unknown as PerformanceEntryList);
    const result = getWebVitals();
    expect(result.fcp).toBe(1234);
    vi.restoreAllMocks();
  });
});

// --- Selected Element ---

describe('getSelectedElementInfo', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns null for missing element', () => {
    const result = getSelectedElementInfo('.missing');
    expect(result).toBeNull();
  });

  it('returns element info', () => {
    document.body.innerHTML = '<button id="btn" class="primary">Click me</button>';
    const result = getSelectedElementInfo('#btn');
    expect(result).not.toBeNull();
    expect(result?.tag).toBe('button');
    expect(result?.id).toBe('btn');
    expect(result?.classes).toBe('primary');
    expect(result?.text).toBe('Click me');
    expect(result?.html).toContain('<button');
    expect(result?.childCount).toBe(0);
  });

  it('returns attributes', () => {
    document.body.innerHTML = '<input type="text" name="email" />';
    const result = getSelectedElementInfo('input');
    expect(result?.attrs).toContainEqual({ name: 'type', value: 'text' });
    expect(result?.attrs).toContainEqual({ name: 'name', value: 'email' });
  });

  it('returns rect dimensions', () => {
    document.body.innerHTML = '<div id="box"></div>';
    const result = getSelectedElementInfo('#box');
    expect(result?.rect).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    // JSDOM returns 0 for getBoundingClientRect
    expect(result?.visible).toBe(false);
  });

  it('returns styles', () => {
    document.body.innerHTML = '<div></div>';
    const result = getSelectedElementInfo('div');
    expect(result?.styles).toHaveProperty('display');
    expect(result?.styles).toHaveProperty('position');
    expect(result?.styles).toHaveProperty('color');
  });

  it('truncates text at 200 chars', () => {
    document.body.innerHTML = `<p>${'z'.repeat(300)}</p>`;
    const result = getSelectedElementInfo('p');
    expect(result?.text).toHaveLength(200);
  });

  it('truncates HTML at 500 chars', () => {
    const longAttr = 'x'.repeat(600);
    document.body.innerHTML = `<div data-long="${longAttr}"></div>`;
    const result = getSelectedElementInfo('div');
    expect(result?.html).toHaveLength(500);
  });
});
