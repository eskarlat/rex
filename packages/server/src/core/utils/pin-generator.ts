import crypto from 'node:crypto';

export function generatePin(): string {
  const num = crypto.randomInt(0, 10000);
  return num.toString().padStart(4, '0');
}
