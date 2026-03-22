import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/browser-scripts.ts
function serializeNode(node, currentDepth, truncateText) {
  if (currentDepth <= 0) return "...";
  const tag = node.tagName.toLowerCase();
  const attrs = Array.from(node.attributes).map((a) => `${a.name}="${a.value}"`).join(" ");
  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
  if (node.children.length === 0) {
    let text = node.textContent?.trim() ?? "";
    if (truncateText !== void 0) text = text.slice(0, truncateText);
    return text ? `${open}${text}</${tag}>` : `${open}</${tag}>`;
  }
  const children = Array.from(node.children).map((child) => serializeNode(child, currentDepth - 1, truncateText)).join("\n");
  return `${open}
${children}
</${tag}>`;
}
function serializeSubtree(sel, maxDepth) {
  const el = document.querySelector(sel);
  if (!el) return `No element found for selector: ${sel}`;
  return serializeNode(el, maxDepth);
}
function serializeFullPage(maxDepth) {
  return serializeNode(document.documentElement, maxDepth, 100);
}
function queryElements(sel) {
  const els = document.querySelectorAll(sel);
  return Array.from(els).map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    id: el.id || "",
    classes: Array.from(el.classList).join(" "),
    text: (el.textContent?.trim() ?? "").slice(0, 80),
    attrs: Array.from(el.attributes).filter((a) => !["id", "class"].includes(a.name)).map((a) => `${a.name}="${a.value}"`).join(", ")
  }));
}
function getComputedStyles(sel, keyProps, showAll) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = getComputedStyle(el);
  const result = [];
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
      if (val && val !== "none" && val !== "normal" && val !== "auto") {
        result.push({ property: prop, value: val });
      }
    }
  }
  return result;
}
function getStorageEntries(type) {
  const store = type === "session" ? sessionStorage : localStorage;
  const result = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key) {
      result.push({ key, value: store.getItem(key) ?? "" });
    }
  }
  return result;
}
function getNavigationTiming() {
  const nav = globalThis.performance.getEntriesByType(
    "navigation"
  )[0];
  if (!nav) return null;
  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domInteractive: nav.domInteractive - nav.fetchStart,
    domComplete: nav.domComplete - nav.fetchStart,
    loadEvent: nav.loadEventEnd - nav.fetchStart
  };
}
function getWebVitals() {
  const entries = globalThis.performance.getEntriesByType("paint");
  const fcp = entries.find((e) => e.name === "first-contentful-paint");
  return {
    fcp: fcp?.startTime ?? null
  };
}
function getSelectedElementInfo(sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList).join(" "),
    text: (el.textContent ?? "").trim().slice(0, 200),
    html: el.outerHTML.slice(0, 500),
    attrs: Array.from(el.attributes).map((a) => ({
      name: a.name,
      value: a.value
    })),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    styles: {
      display: cs.display,
      position: cs.position,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight
    },
    childCount: el.children.length,
    visible: rect.width > 0 && rect.height > 0
  };
}

export {
  serializeSubtree,
  serializeFullPage,
  queryElements,
  getComputedStyles,
  getStorageEntries,
  getNavigationTiming,
  getWebVitals,
  getSelectedElementInfo
};
