import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Expose React for dynamically loaded extension panels
(window as unknown as Record<string, unknown>).__RENRE_REACT__ = React;
(window as unknown as Record<string, unknown>).__RENRE_JSX_RUNTIME__ = jsxRuntime;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
