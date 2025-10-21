import * as fs from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig } from 'tsup'

function ensureExists(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

// 复制文件到dist - 更完善的版本，添加目录清理
const copyFile = (src: string, dest: string) => {
    try {
        const srcPath = join(__dirname, src)
        const destPath = join(__dirname, dest)
        
        // 确保目标目录存在
        const destDir = dirname(destPath)
        ensureExists(destDir)
        
        // 检查源文件是否存在
        if (!fs.existsSync(srcPath)) {
            console.warn(`源文件不存在: ${srcPath}`)

            return
        }
        
        // 如果目标路径已存在且是目录，则删除它
        if (fs.existsSync(destPath)) {
            const stats = fs.statSync(destPath)
            if (stats.isDirectory()) {
                fs.rmSync(destPath, { recursive: true, force: true })
            }
        }
        
        // 复制文件
        fs.copyFileSync(srcPath, destPath)
    }
    catch(error) {
        console.error(`复制文件失败: ${src} -> ${dest}`, error)
    }
}

export default defineConfig({
    entry: ['src/index.ts'],
    target: 'esnext',
    splitting: false,
    clean: true,
    external: [
        'vscode',
    ],
    noExternal: [
        'node-sqlite3-wasm',
    ],
    format: ['cjs'],
    plugins: [
        {
            name: 'copy-files',
            esbuildOptions(_) {
                copyFile('node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm', 'dist/node-sqlite3-wasm.wasm')
            },
        },
    ],
})
