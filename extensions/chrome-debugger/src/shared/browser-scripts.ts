/**
 * Browser-context functions passed to page.evaluate().
 * These run inside Chromium, not Node.js. They are self-contained —
 * they cannot reference outer scope variables.
 *
 * Extracted here so they can be tested directly with JSDOM mocks.
 */

// --- DOM ---

function serializeNode(node: Element, currentDepth: number, truncateText?: number): string {
  if (currentDepth <= 0) return '...';
  const tag = node.tagName.toLowerCase();
  const attrs = Array.from(node.attributes)
    .map((a) => `${a.name}="${a.value}"`)
    .join(' ');
  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  if (node.children.length === 0) {
    let text = node.textContent?.trim() ?? '';
    if (truncateText !== undefined) text = text.slice(0, truncateText);
    return text ? `${open}${text}</${tag}>` : `${open}</${tag}>`;
  }

  const children = Array.from(node.children)
    .map((child) => serializeNode(child, currentDepth - 1, truncateText))
    .join('\n');
  return `${open}\n${children}\n</${tag}>`;
}

export function serializeSubtree(sel: string, maxDepth: number): string {
  const el = document.querySelector(sel);
  if (!el) return `No element found for selector: ${sel}`;
  return serializeNode(el, maxDepth);
}

export function serializeFullPage(maxDepth: number): string {
  return serializeNode(document.documentElement, maxDepth, 100);
}

// --- Select ---

export interface QueryElementResult {
  index: number;
  tag: string;
  id: string;
  classes: string;
  text: string;
  attrs: string;
}

export function queryElements(sel: string): QueryElementResult[] {
  const els = document.querySelectorAll(sel);
  return Array.from(els).map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    classes: Array.from(el.classList).join(' '),
    text: (el.textContent?.trim() ?? '').slice(0, 80),
    attrs: Array.from(el.attributes)
      .filter((a) => !['id', 'class'].includes(a.name))
      .map((a) => `${a.name}="${a.value}"`)
      .join(', '),
  }));
}

// --- Styles ---

export interface ComputedStyleResult {
  property: string;
  value: string;
}

export function getComputedStyles(
  sel: string,
  keyProps: string[],
  showAll: boolean
): ComputedStyleResult[] | null {
  const el = document.querySelector(sel);
  if (!el) return null;

  const cs = getComputedStyle(el);
  const result: ComputedStyleResult[] = [];

  if (showAll) {
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      if (prop) {
        result.push({ property: prop, value: cs.getPropertyValue(prop) });
      }
    }
  } else {
    for (const prop of keyProps) {
      const val = cs.getPropertyValue(prop);
      if (val && val !== 'none' && val !== 'normal' && val !== 'auto') {
        result.push({ property: prop, value: val });
      }
    }
  }

  return result;
}

// --- Storage ---

export interface StorageEntry {
  key: string;
  value: string;
}

export function getStorageEntries(type: string): StorageEntry[] {
  const store = type === 'session' ? sessionStorage : localStorage;
  const result: StorageEntry[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key) {
      result.push({ key, value: store.getItem(key) ?? '' });
    }
  }
  return result;
}

// --- Performance ---

export interface NavigationTimingResult {
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domInteractive: number;
  domComplete: number;
  loadEvent: number;
}

export function getNavigationTiming(): NavigationTimingResult | null {
  const nav = globalThis.performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return null;
  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domInteractive: nav.domInteractive - nav.fetchStart,
    domComplete: nav.domComplete - nav.fetchStart,
    loadEvent: nav.loadEventEnd - nav.fetchStart,
  };
}

export interface WebVitalsResult {
  fcp: number | null;
}

export function getWebVitals(): WebVitalsResult {
  const entries = globalThis.performance.getEntriesByType('paint');
  const fcp = entries.find((e) => e.name === 'first-contentful-paint');
  return {
    fcp: fcp?.startTime ?? null,
  };
}

// --- Selected Element ---

export interface SelectedElementInfo {
  tag: string;
  id: string;
  classes: string;
  text: string;
  html: string;
  attrs: Array<{ name: string; value: string }>;
  rect: { x: number; y: number; width: number; height: number };
  styles: {
    display: string;
    position: string;
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontWeight: string;
  };
  childCount: number;
  visible: boolean;
}

export function getSelectedElementInfo(sel: string): SelectedElementInfo | null {
  const el = document.querySelector(sel);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);

  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList).join(' '),
    text: (el.textContent ?? '').trim().slice(0, 200),
    html: el.outerHTML.slice(0, 500),
    attrs: Array.from(el.attributes).map((a) => ({
      name: a.name,
      value: a.value,
    })),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    styles: {
      display: cs.display,
      position: cs.position,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
    },
    childCount: el.children.length,
    visible: rect.width > 0 && rect.height > 0,
  };
}
