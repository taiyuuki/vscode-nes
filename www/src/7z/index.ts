import wasmUrl from 'js7z-tools/js7z.wasm?url'

interface Extract7zOptions {
    password?: string
    onMessage?(line: string): void
    onError?(line: string): void
    signal?: AbortSignal
    filter?(filePath: string): boolean
    timeoutMs?: number // 可选：解压超时（毫秒），默认 15000
    // 如果宿主不支持 SharedArrayBuffer（无法启用 cross-origin isolation），可选择单线程构建
    singleThread?: boolean

    // 可指定单线程构建的资源位置（当 singleThread 为 true 时优先使用）
    stJsUrl?: string
    stWasmUrl?: string
}

export interface ExtractedFilesMap { [relativePath: string]: Uint8Array }

async function extract7z(data: Uint8Array, options: Extract7zOptions = {}): Promise<ExtractedFilesMap> {
    const { password, onMessage, onError, signal, filter, timeoutMs = 15000, singleThread, stJsUrl, stWasmUrl } = options
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError')

    // 检测 SharedArrayBuffer 支持——多线程构建需要它
    const hasSAB = typeof (globalThis as any).SharedArrayBuffer === 'function'

    // 选择 runtime JS/wasm 路径：优先使用 single-thread 提供的 URL
    const preferSingle = Boolean(singleThread || !hasSAB)

    // If the user placed single-thread build next to this file (./js7z.js, ./js7z.wasm), prefer those
    let wasmPathUrl: string | null = null

    // helper: run extraction with an already-initialized js7z instance
    async function runExtractionWithJS7zInstance(js7zInstance: any): Promise<ExtractedFilesMap> {
        const logs: string[] = []
        const errs: string[] = []

        const inName = '/archive.7z'
        const outDir = '/out'
        js7zInstance.FS.writeFile(inName, data)

        try {
            js7zInstance.FS.mkdir(outDir)
        }
        catch(_err) {

            // ignore
        }

        const args = ['x', inName, '-y', `-o${outDir}`]
        if (password) args.push(`-p${password}`)

        await new Promise<void>((resolve, reject) => {
            let done = false
            const abortHandler = () => {
                if (done) return
                done = true
                reject(new DOMException('aborted', 'AbortError'))
            }
            if (signal) {
                signal.addEventListener('abort', abortHandler, { once: true })
            }

            let watchdog: any = null
            const clearWatchdog = () => {
                if (watchdog) {
                    clearTimeout(watchdog)
                    watchdog = null
                }
            }

            js7zInstance.onExit = (code: number) => {
                if (done) return
                done = true
                if (signal) {
                    signal.removeEventListener('abort', abortHandler)
                }
                clearWatchdog()
                if (code === 0) resolve()
                else reject(new Error(`7z exit code ${code}; logs:\n${logs.join('\n')}\nerrors:\n${errs.join('\n')}`))
            }

            // 超时保护
            watchdog = setTimeout(() => {
                if (done) return
                done = true
                if (signal) {
                    signal.removeEventListener('abort', abortHandler)
                }
                const debug: any = {
                    message: '7z callMain timeout',
                    timeoutMs,
                    args,
                    logs,
                    errs,
                }

                try {
                    debug.root = js7zInstance.FS.readdir('/')
                }
                catch(_e) {
                    debug.rootErr = String(_e)
                }

                try {
                    debug.out = js7zInstance.FS.readdir(outDir)
                }
                catch(_e) {
                    debug.outErr = String(_e)
                }

                reject(new Error(JSON.stringify(debug, null, 2)))
            }, timeoutMs)

            try {
                js7zInstance.callMain(args)
            }
            catch(_err) {
                if (done) return
                done = true
                if (signal) {
                    signal.removeEventListener('abort', abortHandler)
                }
                clearWatchdog()
                reject(_err)
            }
        })

        const result: ExtractedFilesMap = {}
        const walk = (dir: string, prefix = ''): void => {
            const entries: string[] = js7zInstance.FS.readdir(dir)
            for (const name of entries) {
                if (name === '.' || name === '..') continue
                const full = dir === '/' ? `/${name}` : `${dir}/${name}`
                const rel = prefix ? `${prefix}/${name}` : name
                const stat = js7zInstance.FS.stat(full)
                const isDir = js7zInstance.FS.isDir ? js7zInstance.FS.isDir(stat.mode) : (stat.mode & 0o170000) === 0o040000
                if (isDir) {
                    walk(full, rel)
                }
                else if (!filter || filter(rel)) {
                    const fileData: Uint8Array = js7zInstance.FS.readFile(full, { encoding: 'binary' })
                    result[rel] = fileData
                }
            }
        }
        walk(outDir, '')

        return result
    }

    if (preferSingle) {

        // 尝试同目录下的单线程构建（./js7z.js + ./js7z.wasm）
        try {
            wasmPathUrl = new URL('./js7z.wasm', import.meta.url).href
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const modLocal = await import('./js7z.js')
            const JS7zFactoryLocal: any = modLocal.default || modLocal.JS7z || modLocal
            const js7zLocal = await JS7zFactoryLocal({
                locateFile(path: string) {
                    if (path.endsWith('.wasm')) return wasmPathUrl!

                    return path
                },
            })

            return await runExtractionWithJS7zInstance(js7zLocal)
        }
        catch(e) {
            console.warn('Local single-thread js7z not available or failed to load:', e)
            if (stWasmUrl && !wasmPathUrl) wasmPathUrl = stWasmUrl
        }
    }

    // fallback wasm url
    if (!wasmPathUrl) wasmPathUrl = stWasmUrl ?? wasmUrl

    // dynamic import path: prefer provided stJsUrl for ST, otherwise package
    const jsPath = singleThread && stJsUrl ? stJsUrl : 'js7z-tools/js7z.js'

    // 动态加载（按需）
    const mod = await import(/* @vite-ignore */ jsPath)
    const JS7zFactory: any = mod.default || mod.JS7z || mod

    const js7z = await JS7zFactory({
        locateFile(path: string) {
            if (path.endsWith('.wasm')) return wasmPathUrl

            return path
        },
        print(txt: string) { /* collect logs via user callback */ onMessage?.(String(txt)) },
        printErr(txt: string) { onError?.(String(txt)) },
        onAbort(reason: any) { onError?.(`onAbort:${String(reason)}`) },
    })

    return runExtractionWithJS7zInstance(js7z)
}

export { extract7z }
