import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-web/dist/apis/StyleSheet/registry': 'react-native-web/dist/cjs/exports/StyleSheet',
    },
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    },
  },
})
