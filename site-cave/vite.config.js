import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/jayf0x" : "/",
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core';
          if (id.includes('@react-three/postprocessing')) return 'r3f-postprocessing';
          if (id.includes('@react-three/')) return 'r3f';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/jotai') || id.includes('node_modules/leva')) return 'ui-vendor';
        },
      },
    },
  },
  resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    }, 
}));
