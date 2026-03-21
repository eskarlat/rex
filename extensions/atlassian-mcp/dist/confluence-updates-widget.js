// react-global:react
var R = window.__RENRE_REACT__;
var {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  useReducer,
  useId,
  useLayoutEffect,
  useInsertionEffect,
  useImperativeHandle,
  useDebugValue,
  useSyncExternalStore,
  useTransition,
  useDeferredValue,
  createContext,
  createElement,
  createRef,
  forwardRef,
  memo,
  lazy,
  Fragment,
  Suspense,
  StrictMode,
  Component,
  Children,
  cloneElement,
  isValidElement,
  startTransition
} = R;

// react-global:react/jsx-runtime
var { jsx, jsxs, Fragment: Fragment2 } = window.__RENRE_JSX_RUNTIME__;

// src/ui/confluence-updates-widget.tsx
function ConfluenceUpdatesWidget({ sdk, extensionName }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const extName = extensionName ?? "atlassian-mcp";
  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec.run(`${extName}:confluence_search`, {
      cql: 'lastModified >= now("-7d") ORDER BY lastModified DESC',
      limit: 10
    }).then((result) => {
      const data = JSON.parse(result.output);
      const items = (data.results ?? []).map((r) => ({
        title: r.title,
        space: r.space?.key ?? "",
        modifier: r.history?.lastUpdated?.by?.displayName ?? "Unknown",
        time: r.history?.lastUpdated?.when ?? ""
      }));
      setPages(items);
    }).catch(() => setError("Failed to load updates")).finally(() => setLoading(false));
  }, [sdk, extName]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading updates..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-red-500", children: error });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-h-full overflow-auto p-2", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold", children: "Confluence Updates" }),
    pages.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No recent updates." }) : /* @__PURE__ */ jsx("ul", { className: "m-0 list-none p-0", children: pages.map((page, i) => /* @__PURE__ */ jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-[#0052CC]", children: page.title }),
      /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex justify-between text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: page.space }),
        /* @__PURE__ */ jsx("span", { children: page.modifier })
      ] })
    ] }, `${page.title}-${i}`)) })
  ] });
}
export {
  ConfluenceUpdatesWidget as default
};
