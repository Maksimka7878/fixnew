import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      manifestFilename: 'manifest.json',

      manifest: {
        name: 'Fix Price Pro - Магазин товаров для дома',
        short_name: 'FixPrice',
        description: 'Fix Price Pro — удобные покупки по фиксированным ценам, более 2000 товаров, доставка, бонусная программа',
        theme_color: '#43b02a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'ru',
        dir: 'ltr',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        categories: ['shopping', 'business'],
        shortcuts: [
          {
            name: 'Поиск товаров',
            short_name: 'Поиск',
            description: 'Быстрый поиск товаров',
            url: '/search',
            icons: [{ src: 'logo.svg', sizes: '96x96' }]
          },
          {
            name: 'Корзина',
            short_name: 'Корзина',
            description: 'Перейти в корзину',
            url: '/cart',
            icons: [{ src: 'logo.svg', sizes: '96x96' }]
          },
          {
            name: 'Каталог',
            short_name: 'Каталог',
            description: 'Просмотр каталога',
            url: '/catalog',
            icons: [{ src: 'logo.svg', sizes: '96x96' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: '/',
        type: 'module',
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'sonner'],
          'vendor-utils': ['zustand', 'clsx', 'tailwind-merge', 'date-fns'],
        }
      }
    },
    // Target modern browsers
    target: 'es2020',
    // Asset size warnings
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging (optional, remove for smaller builds)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand']
  }
});
