export interface JsonToMarkdownOptions {
  /** Optional top-level heading */
  title?: string;
  /** Max nesting depth before falling back to inline JSON (default: 4) */
  maxDepth?: number;
  /** Filter out common API noise fields like self, expand, _links (default: false) */
  filterNoise?: boolean;
}

const NOISE_KEYS = new Set([
  'self',
  'expand',
  '_links',
  '_expands',
  'avatarUrls',
  'iconUrl',
  'icon',
]);

const PAGINATION_KEYS: Record<string, string> = {
  total: 'total',
  startAt: 'offset',
  start: 'offset',
  offset: 'offset',
  maxResults: 'limit',
  limit: 'limit',
  size: 'count',
};

/**
 * Convert arbitrary JSON data into a human-readable Markdown string
 * optimized for LLM consumption.
 */
export function jsonToMarkdown(data: unknown, options?: JsonToMarkdownOptions): string {
  const maxDepth = options?.maxDepth ?? 4;
  const filterNoise = options?.filterNoise ?? false;

  const lines: string[] = [];

  if (options?.title) {
    lines.push(`# ${options.title}`, '');
  }

  const paginatedResult = tryPaginatedResponse(data, maxDepth, filterNoise);
  if (paginatedResult !== null) {
    lines.push(paginatedResult);
  } else {
    lines.push(renderValue(data, 1, maxDepth, filterNoise));
  }

  return lines.join('\n').trim();
}

function detectPagination(
  data: Record<string, unknown>,
): { fields: Record<string, number>; arrayKey: string } | null {
  const fields: Record<string, number> = {};
  let arrayKey: string | null = null;

  for (const key of Object.keys(data)) {
    const role = PAGINATION_KEYS[key];
    if (role && typeof data[key] === 'number') {
      fields[role] = data[key];
    } else if (Array.isArray(data[key]) && arrayKey === null) {
      arrayKey = key;
    }
  }

  if (!arrayKey) return null;
  const hasPaginationMeta = 'total' in fields || 'offset' in fields || 'limit' in fields;
  return hasPaginationMeta ? { fields, arrayKey } : null;
}

function tryPaginatedResponse(
  data: unknown,
  maxDepth: number,
  filterNoise: boolean,
): string | null {
  if (!isPlainObject(data)) return null;

  const pagination = detectPagination(data);
  if (!pagination) return null;

  const items = data[pagination.arrayKey] as unknown[];
  const lines: string[] = [];

  const total = pagination.fields['total'];
  if (total !== undefined) {
    lines.push(`*Showing ${items.length} of ${total}*`, '');
  }

  lines.push(renderValue(items, 1, maxDepth, filterNoise));

  return lines.join('\n');
}

function renderValue(
  value: unknown,
  depth: number,
  maxDepth: number,
  filterNoise: boolean,
): string {
  if (value === null || value === undefined) return '*none*';
  if (typeof value === 'string') return renderString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return renderArray(value, depth, maxDepth, filterNoise);
  if (isPlainObject(value)) return renderObject(value, depth, maxDepth, filterNoise);
  return typeof value === 'symbol' ? value.toString() : JSON.stringify(value);
}

function renderString(value: string): string {
  if (value === '') return '*(empty)*';
  if (value.includes('\n')) {
    return `\`\`\`\n${value}\n\`\`\``;
  }
  if (isUrl(value)) {
    return `[${value}](${value})`;
  }
  return value;
}

function renderArray(
  arr: unknown[],
  depth: number,
  maxDepth: number,
  filterNoise: boolean,
): string {
  if (arr.length === 0) return '*(empty list)*';

  // Single-item array: render as the item itself
  if (arr.length === 1) {
    return renderValue(arr[0], depth, maxDepth, filterNoise);
  }

  // Array of primitives: bullet list
  if (arr.every(isPrimitive)) {
    return arr.map((item) => `- ${item === null ? '*none*' : String(item)}`).join('\n');
  }

  // Array of objects: try table
  if (arr.every(isPlainObject)) {
    return renderObjectArray(arr, depth, maxDepth, filterNoise);
  }

  // Mixed array: bullet list with recursive rendering
  return arr
    .map((item, i) => {
      const rendered = renderValue(item, depth + 1, maxDepth, filterNoise);
      if (isPrimitive(item)) return `- ${rendered}`;
      return `### Item ${i + 1}\n\n${rendered}`;
    })
    .join('\n');
}

function renderObjectArray(
  arr: Record<string, unknown>[],
  depth: number,
  maxDepth: number,
  filterNoise: boolean,
): string {
  // Collect all keys (union)
  const allKeys = collectTableKeys(arr, filterNoise);

  if (allKeys.length === 0) return '*(empty)*';

  // Check if values are simple enough for a table
  const canTable = arr.every((obj) =>
    allKeys.every((key) => {
      const val = obj[key];
      return val === undefined || val === null || isPrimitive(val) || isSingleValueObject(val);
    }),
  );

  if (canTable) {
    return renderTable(arr, allKeys);
  }

  // Fall back to numbered sections
  return arr
    .map((obj, i) => {
      const heading = '#'.repeat(Math.min(depth + 1, 6));
      const label = findLabel(obj) ?? `Item ${i + 1}`;
      return `${heading} ${label}\n\n${renderObject(obj, depth + 1, maxDepth, filterNoise)}`;
    })
    .join('\n\n');
}

function renderTable(arr: Record<string, unknown>[], keys: string[]): string {
  const headers = keys.map(humanizeKey);
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;

  const dataRows = arr.map((obj) => {
    const cells = keys.map((key) => flattenCellValue(obj[key]));
    return `| ${cells.join(' | ')} |`;
  });

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

function renderObject(
  obj: Record<string, unknown>,
  depth: number,
  maxDepth: number,
  filterNoise: boolean,
): string {
  const entries = Object.entries(obj).filter(
    ([key, val]) => val !== null && val !== undefined && (!filterNoise || !NOISE_KEYS.has(key)),
  );

  if (entries.length === 0) return '*(empty)*';

  if (depth > maxDepth) {
    return `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
  }

  const simpleEntries: Array<[string, unknown]> = [];
  const complexEntries: Array<[string, unknown]> = [];

  for (const [key, val] of entries) {
    if (typeof val === 'string' && val.includes('\n')) {
      complexEntries.push([key, val]);
    } else if (isPrimitive(val)) {
      simpleEntries.push([key, val]);
    } else if (isSingleValueObject(val)) {
      simpleEntries.push([key, extractSingleValue(val as Record<string, unknown>)]);
    } else {
      complexEntries.push([key, val]);
    }
  }

  const lines: string[] = [];

  for (const [key, val] of simpleEntries) {
    const rendered = renderInlineValue(val);
    lines.push(`**${humanizeKey(key)}:** ${rendered}`);
  }

  for (const [key, val] of complexEntries) {
    const heading = '#'.repeat(Math.min(depth + 1, 6));
    lines.push('', `${heading} ${humanizeKey(key)}`, '');
    lines.push(renderValue(val, depth + 1, maxDepth, filterNoise));
  }

  return lines.join('\n');
}

function renderInlineValue(value: unknown): string {
  if (value === null || value === undefined) return '*none*';
  if (typeof value === 'string') {
    if (value === '') return '*(empty)*';
    if (isUrl(value)) return `[${value}](${value})`;
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function flattenCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (isPrimitive(value)) return String(value);
  if (isSingleValueObject(value)) {
    return String(extractSingleValue(value as Record<string, unknown>));
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value.every(isPrimitive)) return value.join(', ');
    if (value.every(isSingleValueObject)) {
      return value
        .map((v) => extractSingleValue(v as Record<string, unknown>))
        .join(', ');
    }
  }
  return JSON.stringify(value);
}

// --- Helpers ---

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/** An object with exactly one meaningful value (e.g., { name: "Done" } or { id: "3", name: "Done" }) */
function isSingleValueObject(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  const meaningfulEntries = entries.filter(
    ([key]) => key !== 'id' && key !== 'self' && key !== 'iconUrl' && key !== 'avatarUrls',
  );
  return meaningfulEntries.length === 1 && isPrimitive(meaningfulEntries[0]![1]);
}

function extractSingleValue(obj: Record<string, unknown>): unknown {
  const meaningful = Object.entries(obj).find(
    ([key]) => key !== 'id' && key !== 'self' && key !== 'iconUrl' && key !== 'avatarUrls',
  );
  return meaningful?.[1] ?? Object.values(obj)[0];
}

function findLabel(obj: Record<string, unknown>): string | null {
  for (const key of ['key', 'name', 'title', 'displayName', 'summary', 'label', 'id']) {
    const val = obj[key];
    if (typeof val === 'string') return val;
  }
  return null;
}

function collectTableKeys(
  arr: Record<string, unknown>[],
  filterNoise: boolean,
): string[] {
  const keySet = new Set<string>();
  for (const obj of arr) {
    for (const key of Object.keys(obj)) {
      if (filterNoise && NOISE_KEYS.has(key)) continue;
      keySet.add(key);
    }
  }
  return [...keySet];
}

function humanizeKey(key: string): string {
  // snake_case → spaces
  let result = key.replace(/_/g, ' ');
  // camelCase → spaces
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Title case
  return result
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}
