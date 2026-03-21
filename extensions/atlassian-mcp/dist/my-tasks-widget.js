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
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading tasks..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-red-500", children: error });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-h-full overflow-auto p-2", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold", children: "My Jira Tasks" }),
    issues.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No assigned issues found." }) : /* @__PURE__ */ jsx("ul", { className: "m-0 list-none p-0", children: issues.map((issue) => /* @__PURE__ */ jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-[#0052CC]", children: issue.key }),
        /* @__PURE__ */ jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[11px]", children: issue.fields.status.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-foreground", children: issue.fields.summary })
    ] }, issue.key)) })
  ] });
}
export {
  MyTasksWidget as default
};
