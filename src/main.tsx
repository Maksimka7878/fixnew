import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event for UpdatePrompt component
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  },
  onOfflineReady() {
    console.log('PWA: Ready to work offline');
  },
  onRegisteredSW(swUrl, r) {
    console.log('PWA: Service Worker registered at:', swUrl);
    // Check for updates periodically (every hour)
    if (r) {
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('PWA: Service Worker registration failed:', error);
  },
});

// Make updateSW available globally for manual updates
(window as any).__updateSW = updateSW;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)

