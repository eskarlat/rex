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
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#6b7280" }, children: "Loading updates..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#ef4444" }, children: error });
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px", overflow: "auto", maxHeight: "100%" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px" }, children: "Confluence Updates" }),
    pages.length === 0 ? /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6b7280" }, children: "No recent updates." }) : /* @__PURE__ */ jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: pages.map((page, i) => /* @__PURE__ */ jsxs(
      "li",
      {
        style: {
          padding: "6px 0",
          borderBottom: "1px solid var(--border, #e5e7eb)",
          fontSize: "12px"
        },
        children: [
          /* @__PURE__ */ jsx("div", { style: { fontWeight: 500, color: "#0052CC" }, children: page.title }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: "2px", color: "#6b7280", fontSize: "11px" }, children: [
            /* @__PURE__ */ jsx("span", { children: page.space }),
            /* @__PURE__ */ jsx("span", { children: page.modifier })
          ] })
        ]
      },
      `${page.title}-${i}`
    )) })
  ] });
}
export {
  ConfluenceUpdatesWidget as default
};
