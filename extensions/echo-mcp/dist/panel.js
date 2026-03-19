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
function EchoMcpPanel({ sdk, extensionName }) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? "echo-mcp";
  async function handleEcho() {
    if (!sdk) {
      setResponse(JSON.stringify({ echo: message || "(empty)" }, null, 2));
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:echo`, { message });
      setResponse(result.output);
    } catch {
      setResponse("Failed to execute echo command.");
    } finally {
      setLoading(false);
    }
  }
  async function handlePing() {
    if (!sdk) {
      setResponse("pong");
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:ping`);
      setResponse(result.output);
    } catch {
      setResponse("Failed to execute ping command.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }, children: "Echo MCP Extension" }),
      /* @__PURE__ */ jsx("p", { style: { color: "var(--muted-foreground, #6b7280)", fontSize: "0.875rem" }, children: "An MCP extension that echoes back messages via JSON-RPC over stdio." }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }, children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block"
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)" }, children: "MCP stdio transport" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 500, marginBottom: "0.75rem" }, children: "Echo" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Type a message to echo...",
            value: message,
            onChange: (e) => setMessage(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") void handleEcho();
            },
            style: {
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              background: "transparent",
              color: "inherit"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => void handleEcho(),
            disabled: loading,
            style: {
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "var(--primary, #2563eb)",
              color: "var(--primary-foreground, #fff)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1
            },
            children: "Echo"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 500, marginBottom: "0.75rem" }, children: "Ping" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.875rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.75rem" }, children: "Verify the MCP server connection is alive." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => void handlePing(),
          disabled: loading,
          style: {
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: "transparent",
            color: "inherit",
            border: "1px solid var(--border, #e5e7eb)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1
          },
          children: loading ? "Pinging..." : "Ping"
        }
      )
    ] }),
    response !== null && /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)", borderRadius: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 500, marginBottom: "0.5rem" }, children: "Response" }),
      /* @__PURE__ */ jsx(
        "pre",
        {
          style: {
            padding: "0.75rem 1rem",
            background: "var(--muted, #f3f4f6)",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            margin: 0
          },
          children: response
        }
      )
    ] })
  ] });
}
export {
  EchoMcpPanel as default
};
