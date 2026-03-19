import fs from 'node:fs';
import path from 'node:path';
import * as clack from '@clack/prompts';
import { install, activate } from '../manager/extension-manager.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import { getDb } from '../../../core/database/database.js';
import { getExtensionDir } from '../../../core/paths/paths.js';
import { checkEngineCompat } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';

const LINK_VERSION = 'dev';

interface ExtLinkOptions {
  localPath: string;
  projectPath: string | null;
}

export async function handleExtLink(options: ExtLinkOptions): Promise<void> {
  const absolutePath = path.resolve(options.localPath);

  if (!fs.existsSync(absolutePath)) {
    clack.log.error(`Path does not exist: ${absolutePath}`);
    return;
  }

  if (!fs.existsSync(path.join(absolutePath, 'manifest.json'))) {
    clack.log.error(`No manifest.json found in ${absolutePath}`);
    return;
  }

  const manifest = loadManifest(absolutePath);

  const compat = checkEngineCompat(manifest, CLI_VERSION, SDK_VERSION);
  if (!compat.compatible) {
    for (const issue of compat.issues) {
      clack.log.warn(issue);
    }
  }

  const linkPath = getExtensionDir(manifest.name, LINK_VERSION);

  // Remove existing link/dir if present
  if (fs.existsSync(linkPath)) {
    fs.rmSync(linkPath, { recursive: true, force: true });
  }

  // Create parent dir and symlink
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.symlinkSync(absolutePath, linkPath);

  const db = getDb();
  install(manifest.name, LINK_VERSION, 'local', manifest.type, db);

  clack.log.success(`Linked ${manifest.name} → ${absolutePath}`);

  if (options.projectPath) {
    const missingKeys = await activate(manifest.name, LINK_VERSION, options.projectPath, linkPath);
    clack.log.success(`Activated ${manifest.name}@${LINK_VERSION} in project.`);
    for (const key of missingKeys) {
      clack.log.warn(`Missing vault key: ${key}`);
    }
  }
}
