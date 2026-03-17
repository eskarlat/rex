import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { VAULT_PATH, GLOBAL_DIR } from '../../core/paths/paths.js';
import {
  pathExistsSync,
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
} from '../../shared/fs-helpers.js';
import {
  ExtensionError,
  ErrorCode,
} from '../../core/errors/extension-error.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const KEY_FILE = path.join(GLOBAL_DIR, '.vault-key');

export interface VaultEntry {
  value: string;
  secret: boolean;
  tags: string[];
}

export interface VaultListEntry {
  key: string;
  value: string;
  secret: boolean;
  tags: string[];
}

type VaultData = Record<string, VaultEntry>;

function deriveKey(): Buffer {
  ensureDirSync(GLOBAL_DIR);
  if (fs.existsSync(KEY_FILE)) {
    const hex = fs.readFileSync(KEY_FILE, 'utf-8').trim();
    return Buffer.from(hex, 'hex');
  }
  const key = crypto.randomBytes(KEY_LENGTH);
  fs.writeFileSync(KEY_FILE, key.toString('hex'), { mode: 0o600 });
  return key;
}

function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // Format: hex(iv) + ':' + hex(authTag) + ':' + hex(ciphertext)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encoded: string): string {
  const parts = encoded.split(':');
  if (parts.length !== 3) {
    throw new ExtensionError(
      '',
      ErrorCode.VAULT_DECRYPT_FAILED,
      'Failed to decrypt vault entry: invalid format',
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts as [string, string, string];

  try {
    const key = deriveKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf-8');
  } catch {
    throw new ExtensionError(
      '',
      ErrorCode.VAULT_DECRYPT_FAILED,
      'Failed to decrypt vault entry: decryption failed',
    );
  }
}

function readVault(): VaultData {
  if (!pathExistsSync(VAULT_PATH)) {
    return {};
  }
  return readJsonSync<VaultData>(VAULT_PATH);
}

function writeVault(data: VaultData): void {
  ensureDirSync(GLOBAL_DIR);
  writeJsonSync(VAULT_PATH, data);
}

export function setEntry(
  key: string,
  value: string,
  secret: boolean,
  tags: string[] = [],
): void {
  const data = readVault();
  data[key] = {
    value: secret ? encrypt(value) : value,
    secret,
    tags,
  };
  writeVault(data);
}

export function getEntry(key: string): VaultEntry | undefined {
  const data = readVault();
  const entry = data[key];
  if (!entry) {
    return undefined;
  }

  if (entry.secret) {
    return {
      value: decrypt(entry.value),
      secret: entry.secret,
      tags: entry.tags,
    };
  }

  return entry;
}

export function removeEntry(key: string): boolean {
  const data = readVault();
  if (!(key in data)) {
    return false;
  }
  delete data[key];
  writeVault(data);
  return true;
}

export function listEntries(): VaultListEntry[] {
  const data = readVault();
  return Object.entries(data).map(([key, entry]) => ({
    key,
    value: entry.secret ? '********' : entry.value,
    secret: entry.secret,
    tags: entry.tags,
  }));
}

export function getDecryptedValue(key: string): string | undefined {
  const entry = getEntry(key);
  return entry?.value;
}

export function hasEntry(key: string): boolean {
  const data = readVault();
  return key in data;
}

export function listKeys(): string[] {
  const data = readVault();
  return Object.keys(data);
}

export function getEntriesByTag(tag: string): VaultListEntry[] {
  return listEntries().filter((e) => e.tags.includes(tag));
}
