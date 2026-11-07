// @ts-check
import { defineConfig } from 'astro/config';
import { AstroPWAIntegration } from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Picur · Monitoreo de vibraciones',
        short_name: 'Picur',
        description:
          'Dashboard móvil para monitorear vibraciones y alertas de los sensores Picur.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        dir: 'ltr',
        theme_color: '#111827',
        background_color: '#f4f7fb',
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      generateSW: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
        globIgnores: ['**/pwa-*.png'],
        navigateFallback: '/offline',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
