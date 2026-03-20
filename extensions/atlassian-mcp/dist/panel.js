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

// src/ui/panel.tsx
function AtlassianPanel({ sdk, extensionName }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? "atlassian-mcp";
  async function handleCheckStatus() {
    if (!sdk) {
      setStatus("SDK not available");
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:status`);
      setStatus(result.output);
    } catch {
      setStatus("Failed to check status.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }, children: "Atlassian MCP" }),
      /* @__PURE__ */ jsx("p", { style: { color: "var(--muted-foreground, #6b7280)", fontSize: "0.875rem" }, children: "Jira and Confluence integration \u2014 72 tools across 21 toolsets." }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }, children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              background: "#0052CC",
              display: "inline-block"
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)" }, children: "MCP stdio transport" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 500, marginBottom: "0.75rem" }, children: "Connection Status" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            handleCheckStatus().catch(() => {
            });
          },
          disabled: loading,
          style: {
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: "var(--primary, #0052CC)",
            color: "var(--primary-foreground, #fff)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1
          },
          children: loading ? "Checking..." : "Check Status"
        }
      ),
      status && /* @__PURE__ */ jsx(
        "pre",
        {
          style: {
            marginTop: "0.75rem",
            padding: "0.75rem 1rem",
            background: "var(--muted, #f3f4f6)",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            margin: "0.75rem 0 0 0"
          },
          children: status
        }
      )
    ] })
  ] });
}
export {
  AtlassianPanel as default
};
