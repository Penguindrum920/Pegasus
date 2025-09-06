import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react(), glsl()],
    build: {
        outDir: resolve(__dirname, '../../public/members'),
        emptyOutDir: true,
    },
    base: '/',
})
