import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    target: 'esnext',
    splitting: false,
    clean: true,
    external: [
        'vscode',
    ],
    format: ['cjs'],
})
