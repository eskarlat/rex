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

// src/ui/status-widget.tsx
function StatusWidget({ sdk, extensionName }) {
  const extName = extensionName ?? "github-mcp";
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function handleCheckStatus() {
    if (!sdk) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.exec.run(`${extName}:status`);
      setOutput(result.output);
    } catch {
      setError("Failed to check status.");
      setOutput(null);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }, children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: error ? "#ef4444" : "#22c55e",
            display: "inline-block"
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "14px", fontWeight: 500 }, children: extName })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => void handleCheckStatus(),
        disabled: loading || !sdk,
        style: {
          padding: "4px 12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          cursor: loading || !sdk ? "not-allowed" : "pointer",
          fontSize: "13px",
          background: "transparent",
          color: "inherit",
          opacity: loading || !sdk ? 0.5 : 1
        },
        children: loading ? "Checking..." : "Check Status"
      }
    ),
    output && /* @__PURE__ */ jsx(
      "pre",
      {
        style: {
          fontSize: "12px",
          marginTop: "8px",
          color: "var(--muted-foreground, #666)",
          whiteSpace: "pre-wrap",
          margin: "8px 0 0"
        },
        children: output
      }
    ),
    error && /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", marginTop: "8px", color: "#ef4444" }, children: error })
  ] });
}
export {
  StatusWidget as default
};
