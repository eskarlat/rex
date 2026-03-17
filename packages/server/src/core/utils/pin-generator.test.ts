import { describe, it, expect } from 'vitest';
import { generatePin } from './pin-generator.js';

describe('generatePin', () => {
  it('returns a 4-character string', () => {
    const pin = generatePin();
    expect(pin).toHaveLength(4);
  });

  it('returns only digits', () => {
    const pin = generatePin();
    expect(pin).toMatch(/^\d{4}$/);
  });

  it('pads with leading zeros when needed', () => {
    // Generate many PINs to increase chance of hitting a low number
    const pins: string[] = [];
    for (let i = 0; i < 100; i++) {
      pins.push(generatePin());
    }
    // All should be 4 digits
    for (const pin of pins) {
      expect(pin).toHaveLength(4);
      expect(pin).toMatch(/^\d{4}$/);
    }
  });

  it('generates different PINs across calls', () => {
    const pins = new Set<string>();
    for (let i = 0; i < 50; i++) {
      pins.add(generatePin());
    }
    // With 50 random 4-digit PINs, we should get at least 2 different ones
    expect(pins.size).toBeGreaterThan(1);
  });
});
