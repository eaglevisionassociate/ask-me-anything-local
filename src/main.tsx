import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const unregisterServiceWorkers = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
  }
};

const rootElement = document.getElementById('root')

void unregisterServiceWorkers().finally(() => {
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
});
