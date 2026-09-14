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
    (window as unknown as { __appMounted?: boolean }).__appMounted = true;
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

// --- Update checker ---------------------------------------------------
// No usamos Service Worker (nos causó problemas antes), así que en vez de eso
// comparamos el archivo JS que está corriendo ahora contra el que está publicado
// en el servidor. Si son distintos, es porque hay una versión nueva: mostramos
// un cartel para recargar con un toque, sin tener que borrar ni re-anclar la app.
function getCurrentBundleSrc(): string | null {
  const script = document.querySelector('script[type="module"][src*="assets/"]');
  return script ? script.getAttribute('src') : null;
}

function showUpdateBanner() {
  if (document.getElementById('update-available-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'update-available-banner';
  banner.style.cssText =
    'position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:99998;background:#0f172a;color:#fff;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.35);font-family:-apple-system,sans-serif;';
  banner.innerHTML =
    '<span style="font-size:18px;">🔄</span>' +
    '<span style="flex:1;font-size:12px;font-weight:600;">Hay una versión nueva de la app</span>' +
    '<button id="update-available-btn" style="background:#0284c7;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-weight:bold;font-size:12px;white-space:nowrap;">Actualizar</button>';
  document.body.appendChild(banner);
  document.getElementById('update-available-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

async function checkForUpdate() {
  try {
    const currentSrc = getCurrentBundleSrc();
    if (!currentSrc) return;
    const res = await fetch(document.baseURI, { cache: 'no-store' });
    if (!res.ok) return;
    const html = await res.text();
    const match = html.match(/src="([^"]*assets\/[^"]+\.js)"/);
    if (match && match[1] && !currentSrc.endsWith(match[1].split('/').pop() as string)) {
      showUpdateBanner();
    }
  } catch (e) {
    // Sin conexión u otro error: no molestamos al usuario, se revisará la próxima vez.
  }
}

// Revisa al abrir la app y cada vez que vuelve a primer plano (por ejemplo,
// al reabrir el ícono anclado después de tenerlo en segundo plano).
setTimeout(checkForUpdate, 2000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkForUpdate();
  }
});
