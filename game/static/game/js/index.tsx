import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Create root element
const rootElement = document.getElementById('react-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
