import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      } ,
      manifest: {
        name: 'Kitsune Legacy',
        short_name: 'Kitsune',
        description: 'Kitsune - Le jeu des nombres'
      }
    })
  ],
  base: './'
})
