import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Limpia cualquier Service Worker viejo que haya quedado activo de versiones
// anteriores de la app (esto puede causar pantalla en blanco en visitas repetidas).
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch(() => {});
  }
} catch (e) {
  // Ignore in restricted environments
}

try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  }
} catch (err) {
  console.error('Fatal initialization error:', err);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, sans-serif; background: #0f172a; color: #fff; padding: 24px; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Error al inicializar</h2>
        <p style="font-size: 13px; color: #94a3b8; max-width: 320px; margin-bottom: 20px;">
          ${(err as Error)?.message || 'No se pudo cargar la interfaz.'}
        </p>
        <button onclick="localStorage.clear(); sessionStorage.clear(); if(window.caches){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n);});});} location.reload();" style="background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; font-size: 13px;">
          Reiniciar Aplicación
        </button>
      </div>
    `;
  }
}
