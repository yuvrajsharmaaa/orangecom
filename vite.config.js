import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls', 'three/examples/jsm/loaders/GLTFLoader']
  }
})