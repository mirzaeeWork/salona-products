import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
     VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Salona Products',
        short_name: 'Salona',
        start_url: '/',
        display: 'standalone',
        background_color: '#F7E8D3',
        theme_color: '#000000',
        icons: [
          {
            src: '/salona.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/salona.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
