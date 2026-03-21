import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ensureDirSync,
  readJsonSync,
  writeJsonSync,
  copyDirSync,
  removeDirSync,
  pathExistsSync,
  readFileSync,
  writeFileSync,
} from './fs-helpers.js';

describe('fs-helpers', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-fs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('ensureDirSync', () => {
    it('should create a directory that does not exist', () => {
      const dir = path.join(tmpDir, 'a', 'b', 'c');
      ensureDirSync(dir);
      expect(fs.existsSync(dir)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      ensureDirSync(tmpDir);
      expect(fs.existsSync(tmpDir)).toBe(true);
    });
  });

  describe('writeJsonSync / readJsonSync', () => {
    it('should write and read JSON', () => {
      const filePath = path.join(tmpDir, 'data.json');
      const data = { name: 'test', version: '1.0.0' };
      writeJsonSync(filePath, data);
      const result = readJsonSync<{ name: string; version: string }>(filePath);
      expect(result).toEqual(data);
    });

    it('should throw when reading non-existent file', () => {
      expect(() => readJsonSync(path.join(tmpDir, 'missing.json'))).toThrow();
    });
  });

  describe('copyDirSync', () => {
    it('should copy directory contents', () => {
      const src = path.join(tmpDir, 'src');
      const dest = path.join(tmpDir, 'dest');
      fs.mkdirSync(src);
      fs.writeFileSync(path.join(src, 'file.txt'), 'hello');
      copyDirSync(src, dest);
      expect(fs.readFileSync(path.join(dest, 'file.txt'), 'utf-8')).toBe('hello');
    });
  });

  describe('removeDirSync', () => {
    it('should remove a directory recursively', () => {
      const dir = path.join(tmpDir, 'to-remove');
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'file.txt'), 'hello');
      removeDirSync(dir);
      expect(fs.existsSync(dir)).toBe(false);
    });

    it('should not throw if directory does not exist', () => {
      expect(() => removeDirSync(path.join(tmpDir, 'nonexistent'))).not.toThrow();
    });
  });

  describe('pathExistsSync', () => {
    it('should return true for existing path', () => {
      expect(pathExistsSync(tmpDir)).toBe(true);
    });

    it('should return false for non-existing path', () => {
      expect(pathExistsSync(path.join(tmpDir, 'nope'))).toBe(false);
    });
  });

  describe('readFileSync / writeFileSync', () => {
    it('should write and read a text file', () => {
      const filePath = path.join(tmpDir, 'test.txt');
      writeFileSync(filePath, 'hello world');
      expect(readFileSync(filePath)).toBe('hello world');
    });

    it('should throw when reading non-existent file', () => {
      expect(() => readFileSync(path.join(tmpDir, 'missing.txt'))).toThrow();
    });
  });
});
