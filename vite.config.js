import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],

  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.js', '.vue', '.json']
  }
})
