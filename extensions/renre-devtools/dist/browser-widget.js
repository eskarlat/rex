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
function extractMcpText(raw) {
  try {
    const parsed = JSON.parse(raw);
    const text = parsed.content?.[0]?.text ?? raw;
    return { text, isError: !!parsed.isError };
  } catch (err) {
    console.warn("[renre-devtools] Failed to parse MCP response as JSON:", err);
    return { text: raw, isError: false };
  }
}
function isChromeNotInstalled(errorText) {
  return errorText.includes("Could not find Chrome") || errorText.includes("puppeteer browsers install");
}
function BrowserWidget({ sdk, extensionName }) {
  const extName = extensionName ?? "renre-devtools";
  const [status, setStatus] = useState("checking");
  const [pageTitle, setPageTitle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [installing, setInstalling] = useState(false);
  const loadingRef = useRef(false);
  useEffect(() => {
    if (!sdk) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
          url: "about:blank"
        });
        if (cancelled) return;
        const { isError, text } = extractMcpText(result.output);
        if (isError && isChromeNotInstalled(text)) {
          setStatus("no-chrome");
        } else if (isError) {
          setStatus("error");
        } else {
          setStatus("running");
          setPageTitle("New Tab");
          setCurrentUrl("about:blank");
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (isChromeNotInstalled(msg)) {
          setStatus("no-chrome");
        } else {
          setStatus("idle");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sdk, extName]);
  const fetchPageInfo = useCallback(async () => {
    if (!sdk || loadingRef.current) return true;
    try {
      const result = await sdk.exec.run(`${extName}:puppeteer_evaluate`, {
        script: "JSON.stringify({ url: document.URL, title: document.title })"
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) return true;
      try {
        const info = JSON.parse(text);
        setCurrentUrl(info.url ?? null);
        setPageTitle(info.title ?? null);
      } catch (err) {
        console.warn("[renre-devtools] Failed to parse page info:", err);
      }
      return true;
    } catch (err) {
      console.error("[renre-devtools] fetchPageInfo failed:", err);
      return false;
    }
  }, [sdk, extName]);
  async function handleLaunch() {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
        url: "about:blank"
      });
      const { isError, text } = extractMcpText(result.output);
      if (isError && isChromeNotInstalled(text)) {
        setStatus("no-chrome");
        setLoading(false);
        return;
      }
      setStatus(isError ? "error" : "running");
      if (!isError) {
        setPageTitle("New Tab");
        loadingRef.current = false;
        setLoading(false);
        void fetchPageInfo();
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isChromeNotInstalled(msg)) {
        setStatus("no-chrome");
      } else {
        setStatus("error");
      }
    }
    setLoading(false);
  }
  async function handleRefresh() {
    if (!sdk) return;
    setLoading(true);
    try {
      await fetchPageInfo();
    } catch (err) {
      console.warn("[renre-devtools] Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }
  function handleInstallChrome() {
    if (!sdk) return;
    setInstalling(true);
    sdk.terminal.open();
    sdk.terminal.send("npx puppeteer browsers install chrome\n");
    const pollTimer = setInterval(() => {
      void (async () => {
        try {
          const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
            url: "about:blank"
          });
          const { isError, text } = extractMcpText(result.output);
          if (!isError || !isChromeNotInstalled(text)) {
            clearInterval(pollTimer);
            setInstalling(false);
            setStatus(isError ? "error" : "running");
            if (!isError) {
              setPageTitle("New Tab");
              setCurrentUrl("about:blank");
            }
          }
        } catch (err) {
          console.warn("[renre-devtools] Chrome install poll failed:", err);
        }
      })();
    }, 5e3);
    setTimeout(() => {
      clearInterval(pollTimer);
      setInstalling(false);
    }, 12e4);
  }
  loadingRef.current = loading;
  useEffect(() => {
    if (status !== "running" || !sdk) return;
    const interval = setInterval(() => {
      if (loadingRef.current) return;
      void fetchPageInfo().then((alive) => {
        if (!alive) {
          setStatus("crashed");
          setPageTitle(null);
          setCurrentUrl(null);
        }
      });
    }, 1e4);
    return () => clearInterval(interval);
  }, [status, sdk, fetchPageInfo]);
  const statusDot = status === "running" ? "bg-emerald-500" : status === "error" || status === "crashed" ? "bg-red-500" : status === "no-chrome" ? "bg-amber-500" : status === "checking" ? "bg-blue-400 animate-pulse" : "bg-zinc-400";
  const statusLabel = status === "running" ? "Running" : status === "error" ? "Error" : status === "crashed" ? "Crashed" : status === "no-chrome" ? "Setup required" : status === "checking" ? "Checking..." : "Stopped";
  if (status === "no-chrome") {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-2.5 p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: `inline-block h-2 w-2 shrink-0 rounded-full ${statusDot}` }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Browser" }),
        /* @__PURE__ */ jsx("span", { className: "ml-auto text-[11px] text-muted-foreground", children: statusLabel })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-snug text-muted-foreground", children: "Chrome is not installed. Install it to use browser automation." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleInstallChrome,
          disabled: installing || !sdk,
          className: "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
          children: installing ? "Installing..." : "Install Chrome"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-2 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: `inline-block h-2 w-2 shrink-0 rounded-full ${statusDot}` }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Browser" }),
      /* @__PURE__ */ jsx("span", { className: "ml-auto text-[11px] text-muted-foreground", children: statusLabel })
    ] }),
    status === "running" && (pageTitle || currentUrl) && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
      pageTitle && /* @__PURE__ */ jsx("span", { className: "truncate text-[13px] font-medium", children: pageTitle }),
      currentUrl && /* @__PURE__ */ jsx("span", { className: "truncate font-mono text-[11px] text-muted-foreground", children: currentUrl })
    ] }),
    status === "crashed" && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Browser crashed or became unreachable." }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: status === "running" ? /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => void handleRefresh(),
        disabled: loading,
        className: "inline-flex h-[30px] items-center justify-center rounded-md border border-border bg-transparent px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50",
        children: loading ? "Refreshing..." : "Refresh"
      }
    ) : /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => void handleLaunch(),
        disabled: loading || !sdk || status === "checking",
        className: "inline-flex h-[30px] items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
        children: loading ? "Starting..." : status === "crashed" ? "Restart" : "Launch"
      }
    ) })
  ] });
}
export {
  BrowserWidget as default
};
