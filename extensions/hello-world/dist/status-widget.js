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
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? "hello-world";
  async function handleQuickGreet() {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:greet`, {});
      setOutput(result.output);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", fontWeight: 500, marginBottom: "8px" }, children: extName }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleQuickGreet,
        disabled: loading || !sdk,
        style: {
          padding: "4px 12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          cursor: loading ? "wait" : "pointer",
          fontSize: "13px"
        },
        children: loading ? "Greeting..." : "Quick Greet"
      }
    ),
    output && /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", marginTop: "8px", color: "#666" }, children: output })
  ] });
}
export {
  StatusWidget as default
};
