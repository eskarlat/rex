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

// src/ui/comments-widget.tsx
function CommentsWidget({ sdk, extensionName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const extName = extensionName ?? "atlassian-mcp";
  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec.run(`${extName}:jira_search`, {
      jql: 'issueFunction in commented("by currentUser()") ORDER BY updated DESC',
      maxResults: 10,
      fields: ["summary", "comment"]
    }).then((result) => {
      const data = JSON.parse(result.output);
      const flat = (data.issues ?? []).flatMap((issue) => {
        const comments = issue.fields.comment?.comments ?? [];
        const latest = comments[comments.length - 1];
        if (!latest) return [];
        return [{
          key: issue.key,
          author: latest.author.displayName,
          snippet: String(latest.body).slice(0, 80),
          time: latest.updated
        }];
      });
      setItems(flat);
    }).catch(() => setError("Failed to load comments")).finally(() => setLoading(false));
  }, [sdk, extName]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#6b7280" }, children: "Loading comments..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#ef4444" }, children: error });
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px", overflow: "auto", maxHeight: "100%" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px" }, children: "Recent Comments" }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6b7280" }, children: "No recent comments." }) : /* @__PURE__ */ jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: items.map((item, i) => /* @__PURE__ */ jsxs(
      "li",
      {
        style: {
          padding: "6px 0",
          borderBottom: "1px solid var(--border, #e5e7eb)",
          fontSize: "12px"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontWeight: 500, color: "#0052CC" }, children: item.key }),
            /* @__PURE__ */ jsx("span", { style: { color: "#6b7280", fontSize: "11px" }, children: item.author })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { color: "#374151", marginTop: "2px" }, children: item.snippet })
        ]
      },
      `${item.key}-${i}`
    )) })
  ] });
}
export {
  CommentsWidget as default
};
