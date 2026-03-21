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
  return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm font-medium", children: extName }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleQuickGreet,
        disabled: loading || !sdk,
        className: "inline-flex h-8 items-center rounded border border-border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50",
        children: loading ? "Greeting..." : "Quick Greet"
      }
    ),
    output && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: output })
  ] });
}
export {
  StatusWidget as default
};
