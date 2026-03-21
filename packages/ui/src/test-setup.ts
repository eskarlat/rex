import '@testing-library/jest-dom';

// Polyfill ResizeObserver for Radix UI components in jsdom
class ResizeObserverMock {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

// Polyfill window.matchMedia for useIsMobile hook in jsdom
if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
        /* noop */
      },
      removeListener: () => {
        /* noop */
      },
      addEventListener: () => {
        /* noop */
      },
      removeEventListener: () => {
        /* noop */
      },
      dispatchEvent: () => false,
    }),
  });
}
