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

// src/ui/my-tasks-widget.tsx
function MyTasksWidget({ sdk, extensionName }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const extName = extensionName ?? "atlassian-mcp";
  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec.run(`${extName}:jira_search`, {
      jql: "assignee = currentUser() ORDER BY updated DESC",
      maxResults: 10
    }).then((result) => {
      const data = JSON.parse(result.output);
      setIssues(data.issues ?? []);
    }).catch(() => setError("Failed to load tasks")).finally(() => setLoading(false));
  }, [sdk, extName]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#6b7280" }, children: "Loading tasks..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "12px", fontSize: "13px", color: "#ef4444" }, children: error });
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px", overflow: "auto", maxHeight: "100%" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px" }, children: "My Jira Tasks" }),
    issues.length === 0 ? /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6b7280" }, children: "No assigned issues found." }) : /* @__PURE__ */ jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: issues.map((issue) => /* @__PURE__ */ jsxs(
      "li",
      {
        style: {
          padding: "6px 0",
          borderBottom: "1px solid var(--border, #e5e7eb)",
          fontSize: "12px"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontWeight: 500, color: "#0052CC" }, children: issue.key }),
            /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "var(--muted, #f3f4f6)"
                },
                children: issue.fields.status.name
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { color: "#374151", marginTop: "2px" }, children: issue.fields.summary })
        ]
      },
      issue.key
    )) })
  ] });
}
export {
  MyTasksWidget as default
};
