import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      external: [/^figma:/],
    },
  },

  // Custom plugin to resolve figma: asset imports during development
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'figma-asset-resolver',
      resolveId(id) {
        if (id.startsWith('figma:asset/')) {
          return id;
        }
      },
      load(id) {
        if (id.startsWith('figma:asset/')) {
          return `export default "${id}"`;
        }
      }
    }
  ],
})
