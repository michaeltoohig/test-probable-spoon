import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'
import Inspect from 'vite-plugin-inspect'
import { visualizer } from 'rollup-plugin-visualizer'
const path = require('path')


const pwaOptions: Partial<VitePWAOptions> = {
  // mode: 'development',
  base: '/',
  // includeAssets: ['favicon.svg'],
  strategies: 'injectManifest',
  srcDir: 'src/service-worker',
  filename: 'sw.ts',
  navigateFallback: 'index.html',
  // injectManifest: {
  //   swSrc: 'src/sw.ts',
  //   swDest: 'dist/sw.js',
  //   globDirectory: 'dist',
  //   globPatterns: [
  //     '**/*.{html,js,css,json,png,webp,jpg}',
  //   ],
  // },
  // mode: 'development',
  includeAssets: ['**/*'],
  workbox: {
    globPatterns: ['**/*'],
  },
  // registerType: 'autoUpdate',
  manifest: {
    name: 'PWA Router',
    short_name: 'PWA Router',
    theme_color: '#ffffff',
    lang: 'en',
    icons: [
      {
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png'
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'  
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
    suppressWarnings: true,
  },
}

// const claims = process.env.CLAIMS === 'true'
// const selfDestroying = process.env.SW_DESTROY === 'true'

// if (process.env.SW === 'true') {
//   pwaOptions.srcDir = 'src'
//   pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
//   pwaOptions.strategies = 'injectManifest'
//   ;(pwaOptions.manifest as Partial<ManifestOptions>).name = 'PWA Inject Manifest'
//   ;(pwaOptions.manifest as Partial<ManifestOptions>).short_name = 'PWA Inject'
// }

// if (true || claims)
//   pwaOptions.registerType = 'autoUpdate'

// if (selfDestroying)
//   pwaOptions.selfDestroying = selfDestroying


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [
      vue(),
      vueJsx(),
      Inspect({
        build: true,
        outputDir: '.vite-inspect'
      }),
      visualizer({
        gzipSize: true,
        brotliSize: true,
        open: false,
        template: 'sunburst',
        filename: '.rollup-inspect/index.html'
      }),
      replace({
        __DATE__: new Date().toISOString(),
        __RELOAD_SW__: process.env.RELOAD_SW === 'true' ? 'true' : 'false',
      }),
      VitePWA(pwaOptions),
      // {
      //   registerType: 'autoUpdate',
      //   manifest: {
      //     name: 'My Awesome App',
      //     short_name: 'MyApp',
      //     description: 'My Awesome App description',
      //     theme_color: '#ffffff',
      //     icons: [
      //       {
      //         src: 'pwa-64x64.png',
      //         sizes: '64x64',
      //         type: 'image/png'
      //       },
      //       {
      //         src: 'pwa-192x192.png',
      //         sizes: '192x192',
      //         type: 'image/png'
      //       },
      //       {
      //         src: 'pwa-512x512.png',
      //         sizes: '512x512',
      //         type: 'image/png',
      //         purpose: 'any'  
      //       },
      //       {
      //         src: 'maskable-icon-512x512.png',
      //         sizes: '512x512',
      //         type: 'image/png',
      //         purpose: 'maskable'
      //       }
      //     ],
      //   },
      //   devOptions: {
      //     enabled: true
      //   },
      // }),
      // VitePWA({
      //   base: '/',
      //   registerType: 'prompt',
      //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-dark.svg'],
      //   manifest: {
      //     name: 'vite-template',
      //     short_name: 'vite-template',
      //     theme_color: '#ffffff',
      //     icons: [
      //       {
      //         src: '/pwa-192x192.png',
      //         sizes: '192x192',
      //         type: 'image/png'
      //       },
      //       {
      //         src: '/pwa-512x512.png',
      //         sizes: '512x512',
      //         type: 'image/png'
      //       },
      //       {
      //         src: '/pwa-512x512.png',
      //         sizes: '512x512',
      //         type: 'image/png',
      //         purpose: 'any maskable'
      //       }
      //     ]
      //   },
      //   workbox: {
      //     globPatterns: ['**/*.{js,css}'],
      //     navigateFallback: '/',
      //     cleanupOutdatedCaches: true
      //   },
      //   // client: {
      //   //   installPrompt: true,
      //   //   periodicSyncForUpdates: 20
      //   // },
      //   devOptions: {
      //     enabled: true,
      //     type: 'module'
      //   }
      // })
    ],
    resolve: {
      extensions: [
        '.spec.ts',
        '.test.ts',
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
        '.scss'
      ],
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
