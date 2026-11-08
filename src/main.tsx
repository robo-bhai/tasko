import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initViewportHeight } from './utils/viewport';

// Bump this value to wipe all old caches + service workers on every device (runs once per version).
const APP_CACHE_VERSION = '2026-11-08-v2';
const CACHE_KEY = 'kc_app_cache_version';

async function purgeOldCaches(): Promise<boolean> {
  try {
    if (localStorage.getItem(CACHE_KEY) === APP_CACHE_VERSION) return false;
    // Mark first so we never loop. Login/data in localStorage is left untouched.
    localStorage.setItem(CACHE_KEY, APP_CACHE_VERSION);

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    return true;
  } catch {
    return false;
  }
}

initViewportHeight();

purgeOldCaches().then(purged => {
  // Reload once so the fresh build + new service worker load cleanly.
  if (purged) {
    window.location.reload();
    return;
  }
  createRoot(document.getElementById('root')!).render(<App />);
});
