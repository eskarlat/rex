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
function DevToolsPanel({ sdk }) {
  const [output, setOutput] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (command, args) => {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`renre-devtools:${command}`, args);
      setOutput(result.output);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: { padding: "16px", fontFamily: "system-ui" }, children: [
    /* @__PURE__ */ jsx("h2", { children: "Browser DevTools" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ jsx("button", { onClick: () => run("launch"), disabled: loading, children: "Launch" }),
      /* @__PURE__ */ jsx("button", { onClick: () => run("close"), disabled: loading, children: "Close" }),
      /* @__PURE__ */ jsx("button", { onClick: () => run("tabs"), disabled: loading, children: "Tabs" }),
      /* @__PURE__ */ jsx("button", { onClick: () => run("screenshot"), disabled: loading, children: "Screenshot" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "https://example.com",
          value: url,
          onChange: (e) => setUrl(e.target.value),
          style: { flex: 1, padding: "4px 8px" }
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: () => run("navigate", { url }), disabled: loading || !url, children: "Navigate" })
    ] }),
    /* @__PURE__ */ jsx(
      "pre",
      {
        style: {
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          maxHeight: "400px",
          fontSize: "13px",
          whiteSpace: "pre-wrap"
        },
        children: loading ? "Loading..." : output || "No output yet. Launch a browser to get started."
      }
    )
  ] });
}
export {
  DevToolsPanel as default
};
