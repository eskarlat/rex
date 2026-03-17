import fs from 'fs-extra';

export function ensureDirSync(dirPath: string): void {
  fs.ensureDirSync(dirPath);
}

export function readJsonSync<T>(filePath: string): T {
  return fs.readJsonSync(filePath) as T;
}

export function writeJsonSync(filePath: string, data: unknown): void {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
}

export function copyDirSync(src: string, dest: string): void {
  fs.copySync(src, dest);
}

export function removeDirSync(dirPath: string): void {
  fs.removeSync(dirPath);
}

export function pathExistsSync(filePath: string): boolean {
  return fs.pathExistsSync(filePath);
}

export function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function writeFileSync(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}
