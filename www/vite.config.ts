import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    base: './', // Ensure relative URLs resolve correctly
    plugins: [vue()],
    build: { 
        outDir: '../res/webview',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/@nesjs/core')) {
                        return 'nesjs-core'
                    }
                },
            },
        },
    },
})
