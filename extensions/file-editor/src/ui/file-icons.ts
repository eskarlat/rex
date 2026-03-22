const FILE_ICONS: Record<string, string> = {
  ts: '\uD83D\uDFE6', tsx: '\u269B\uFE0F', js: '\uD83D\uDFE8', jsx: '\u269B\uFE0F',
  json: '\uD83D\uDCCB', md: '\uD83D\uDCDD',
  css: '\uD83C\uDFA8', scss: '\uD83C\uDFA8', html: '\uD83C\uDF10',
  svg: '\uD83D\uDDBC\uFE0F', png: '\uD83D\uDDBC\uFE0F', jpg: '\uD83D\uDDBC\uFE0F',
  py: '\uD83D\uDC0D', rb: '\uD83D\uDC8E', rs: '\uD83E\uDD80', go: '\uD83D\uDC39',
  java: '\u2615', sh: '\uD83D\uDC1A',
  yaml: '\u2699\uFE0F', yml: '\u2699\uFE0F', toml: '\u2699\uFE0F',
  sql: '\uD83D\uDDC4\uFE0F', dockerfile: '\uD83D\uDC33',
  gitignore: '\uD83D\uDCC2', env: '\uD83D\uDD12', lock: '\uD83D\uDD12',
};

export function getFileIcon(name: string, type: 'file' | 'directory', expanded?: boolean): string {
  if (type === 'directory') return expanded ? '\uD83D\uDCC2' : '\uD83D\uDCC1';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? '\uD83D\uDCC4';
}
