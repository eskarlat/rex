import fse from 'fs-extra';
import path from 'node:path';

import {
  getStandardPackageJson,
  getStandardManifest,
  getStandardEntryPoint,
  getStandardCommandHandler,
  getStandardTsconfig,
  getStandardSkillMd,
  getStandardBuildJs,
} from './templates/standard.js';
import {
  getMcpPackageJson,
  getMcpManifest,
  getMcpServerEntryPoint,
  getMcpTsconfig,
  getMcpSkillMd,
  getMcpBuildJs,
} from './templates/mcp.js';

export type ExtensionType = 'standard' | 'mcp';

interface FileEntry {
  filePath: string;
  content: string;
}

function getStandardFiles(name: string, extDir: string): FileEntry[] {
  return [
    { filePath: path.join(extDir, 'package.json'), content: getStandardPackageJson(name) },
    { filePath: path.join(extDir, 'manifest.json'), content: getStandardManifest(name) },
    { filePath: path.join(extDir, 'src', 'index.ts'), content: getStandardEntryPoint(name) },
    {
      filePath: path.join(extDir, 'src', 'commands', 'hello.ts'),
      content: getStandardCommandHandler(name),
    },
    { filePath: path.join(extDir, 'tsconfig.json'), content: getStandardTsconfig() },
    { filePath: path.join(extDir, 'build.js'), content: getStandardBuildJs() },
    { filePath: path.join(extDir, 'SKILL.md'), content: getStandardSkillMd(name) },
  ];
}

function getMcpFiles(name: string, extDir: string): FileEntry[] {
  return [
    { filePath: path.join(extDir, 'package.json'), content: getMcpPackageJson(name) },
    { filePath: path.join(extDir, 'manifest.json'), content: getMcpManifest(name) },
    { filePath: path.join(extDir, 'src', 'server.ts'), content: getMcpServerEntryPoint(name) },
    { filePath: path.join(extDir, 'tsconfig.json'), content: getMcpTsconfig() },
    { filePath: path.join(extDir, 'build.js'), content: getMcpBuildJs() },
    { filePath: path.join(extDir, 'SKILL.md'), content: getMcpSkillMd(name) },
  ];
}

export async function scaffoldExtension(
  name: string,
  type: ExtensionType,
  outputDir: string,
): Promise<void> {
  const extDir = path.join(outputDir, name);

  if (await fse.pathExists(extDir)) {
    throw new Error(`Directory "${name}" already exists`);
  }

  const files = type === 'mcp' ? getMcpFiles(name, extDir) : getStandardFiles(name, extDir);

  for (const file of files) {
    await fse.ensureDir(path.dirname(file.filePath));
    await fse.writeFile(file.filePath, file.content, 'utf-8');
  }
}
