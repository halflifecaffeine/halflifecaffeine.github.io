import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  base: '/',
  // Configure build output
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure assets are properly handled
    assetsDir: 'assets',
  },
})
