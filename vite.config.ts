import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'
import { fileSavePlugin } from './vite-plugins/file-save-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    fileSavePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // exclude very large gallery assets from the precache manifest
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot}'],
        globIgnores: ['**/images/gallery/**'],
        // increase file size limit (12 MiB) to allow larger assets if necessary
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        // Exclude dynamic URLs from navigation fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              }
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Add background sync
        mode: 'production'
      },
      devOptions: {
        enabled: false
      },
      includeAssets: [
        'favicon.ico', 
        'images/adaptive-icon.png',
        'images/splash-icon.png'
      ],
      manifest: {
        name: 'SPIRITHUB ROASTERY',
        short_name: 'SPIRITHUB',
        description: 'Premium Coffee Experience - Best Coffee Roastery',
        theme_color: '#d97706',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['food', 'lifestyle', 'business'],
        icons: [
          {
            src: 'images/icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'images/adaptive-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          routing: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          i18n: ['react-i18next', 'i18next', 'i18next-browser-languagedetector']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})