import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
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
    /^\/api\//,
    /firestore\.googleapis\.com/,
    /firebase/
  ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ url }) => {
              // Only cache static Firestore API calls, exclude dynamic session URLs
              const isFirestore = url.origin === 'https://firestore.googleapis.com';
              const hasSession = url.pathname.includes(':runQuery') || 
                                url.pathname.includes(':listen') || 
                                url.pathname.includes('/sessions/') ||
                                url.searchParams.has('database');
              return isFirestore && !hasSession;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 2 * 60, // Reduced cache time
              },
            },
          },
          {
            // Cache static document reads only
            urlPattern: ({ url, request }) => {
              const isFirestore = url.origin === 'https://firestore.googleapis.com';
              const isDocumentRead = url.pathname.includes('/documents/') && 
                                   !url.pathname.includes(':') &&
                                   request.method === 'GET';
              return isFirestore && isDocumentRead;
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'firestore-documents-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 10 * 60, // 10 minutes for static documents
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false
      },
      includeAssets: [
        'favicon.ico', 
        'images/icon.png', 
        'images/logo.png',
        'images/logo-s.png',
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
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})