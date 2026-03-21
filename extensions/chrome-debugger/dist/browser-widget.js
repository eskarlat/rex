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

// src/ui/browser-widget.tsx
function BrowserStatusWidget({ sdk }) {
  const [status, setStatus] = useState("Unknown");
  useEffect(() => {
    if (!sdk) return;
    sdk.exec.run("renre-devtools:tabs").then((result) => {
      setStatus(result.output.includes("Open Tabs") ? "Running" : "Stopped");
    }).catch(() => {
      setStatus("Stopped");
    });
  }, [sdk]);
  return /* @__PURE__ */ jsxs("div", { style: { padding: "12px", fontFamily: "system-ui" }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: "14px", fontWeight: 600 }, children: "Browser Status" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          marginTop: "8px",
          fontSize: "24px",
          fontWeight: 700,
          color: status === "Running" ? "#22c55e" : "#94a3b8"
        },
        children: status
      }
    )
  ] });
}
export {
  BrowserStatusWidget as default
};
