import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'manifest.json'],
      manifestFilename: 'manifest.json',
      useCredentials: true,
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'], // Removed webp from precache to avoid downloading 1000+ images on install
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Cache local product/category images (WebP)
          {
            urlPattern: /^\/images\/.*\.(webp|png|jpg|jpeg|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          // Cache external images (if any remain)
          {
            urlPattern: /^https:\/\/(.*)\.(jpg|jpeg|png|webp|gif|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache API responses
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst', // Changed to NetworkFirst for fresh data, falling back to cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: '/'
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
