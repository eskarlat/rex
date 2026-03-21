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
        return [
          {
            key: issue.key,
            author: latest.author.displayName,
            snippet: String(latest.body).slice(0, 80),
            time: latest.updated
          }
        ];
      });
      setItems(flat);
    }).catch(() => setError("Failed to load comments")).finally(() => setLoading(false));
  }, [sdk, extName]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading comments..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-red-500", children: error });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-h-full overflow-auto p-2", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold", children: "Recent Comments" }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No recent comments." }) : /* @__PURE__ */ jsx("ul", { className: "m-0 list-none p-0", children: items.map((item, i) => /* @__PURE__ */ jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-[#0052CC]", children: item.key }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: item.author })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-foreground", children: item.snippet })
    ] }, `${item.key}-${i}`)) })
  ] });
}
export {
  CommentsWidget as default
};
