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
function MiroPanel({ sdk, extensionName }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? "miro-mcp";
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xl font-semibold", children: "Miro MCP" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Miro integration \u2014 98 tools across 21 toolsets." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-[#FFD02F]" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "MCP stdio transport" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-3 text-base font-medium", children: "Connection Status" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            handleCheckStatus().catch(() => {
            });
          },
          disabled: loading,
          className: "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
          children: loading ? "Checking..." : "Check Status"
        }
      ),
      status && /* @__PURE__ */ jsx("pre", { className: "mt-3 whitespace-pre-wrap rounded-md bg-muted p-3 font-mono text-[13px]", children: status })
    ] })
  ] });
}
export {
  MiroPanel as default
};
