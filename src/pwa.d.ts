/// <reference types="vite-plugin-pwa/client" />

// Augment the global Window interface to include our custom updateSW function
declare global {
    interface Window {
        __updateSW?: (reloadPage?: boolean) => Promise<void>;
    }
}

export { };
