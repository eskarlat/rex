import { describe, it, expect } from 'vitest';
import { OutputBuffer } from './output-buffer.js';

describe('OutputBuffer', () => {
  it('starts empty', () => {
    const buf = new OutputBuffer();
    expect(buf.getContents()).toBe('');
    expect(buf.size).toBe(0);
  });

  it('appends data and returns it', () => {
    const buf = new OutputBuffer();
    buf.append('hello');
    buf.append(' world');
    expect(buf.getContents()).toBe('hello world');
    expect(buf.size).toBe(11);
  });

  it('evicts oldest chunks when over maxBytes', () => {
    const buf = new OutputBuffer(10);
    buf.append('aaaa'); // 4 bytes
    buf.append('bbbb'); // 4 bytes — total 8
    buf.append('cccc'); // 4 bytes — total 12, evict 'aaaa' → 8

    expect(buf.getContents()).toBe('bbbbcccc');
    expect(buf.size).toBe(8);
  });

  it('evicts multiple oldest chunks if needed', () => {
    const buf = new OutputBuffer(10);
    buf.append('aaa'); // 3
    buf.append('bbb'); // 3 — total 6
    buf.append('ccc'); // 3 — total 9
    buf.append('ddddddddd'); // 9 — total 18, evict 'aaa','bbb','ccc' → 9

    expect(buf.getContents()).toBe('ddddddddd');
    expect(buf.size).toBe(9);
  });

  it('handles a single chunk larger than maxBytes', () => {
    const buf = new OutputBuffer(5);
    buf.append('abcdefghij'); // 10 bytes, exceeds max

    // Keeps the chunk (can't split it), but evicted everything before
    expect(buf.getContents()).toBe('abcdefghij');
    expect(buf.size).toBe(10);
  });

  it('clears all data', () => {
    const buf = new OutputBuffer();
    buf.append('hello');
    buf.append(' world');
    buf.clear();

    expect(buf.getContents()).toBe('');
    expect(buf.size).toBe(0);
  });

  it('uses default 50KB max when no argument given', () => {
    const buf = new OutputBuffer();
    // Fill with 51KB
    const chunk = 'x'.repeat(1024);
    for (let i = 0; i < 51; i++) {
      buf.append(chunk);
    }
    // Should have evicted some
    expect(buf.size).toBeLessThanOrEqual(50 * 1024);
  });
});
