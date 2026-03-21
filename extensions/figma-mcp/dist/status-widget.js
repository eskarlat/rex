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
  const extName = extensionName ?? "figma-mcp";
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
  return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: `inline-block h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}` }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: extName })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => void handleCheckStatus(),
        disabled: loading || !sdk,
        className: "inline-flex h-8 items-center rounded border border-border bg-transparent px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50",
        children: loading ? "Checking..." : "Check Status"
      }
    ),
    output && /* @__PURE__ */ jsx("pre", { className: "mt-2 whitespace-pre-wrap text-xs text-muted-foreground", children: output }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-500", children: error })
  ] });
}
export {
  StatusWidget as default
};
