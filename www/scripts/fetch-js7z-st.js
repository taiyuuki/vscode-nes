#!/usr/bin/env node
// Fetch JS7z single-thread build (ST) from GitHub releases and save to www/public
// Usage: node scripts/fetch-js7z-st.js

const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

const owner = 'GMH-Code'
const repo = 'JS7z'
const outDir = path.join(__dirname, '..', 'public')

function getJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'node' } }, res => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try { resolve(JSON.parse(data)) }
                catch(e) { reject(e) }
            })
        }).on('error', reject)
    })
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'node' } }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {

                // Follow redirect
                return download(res.headers.location, dest).then(resolve)
                    .catch(reject)
            }
            if (res.statusCode !== 200) return reject(new Error(`Failed to download ${url} status ${res.statusCode}`))
            const file = fs.createWriteStream(dest)
            res.pipe(file)
            file.on('finish', () => file.close(resolve))
            file.on('error', reject)
        }).on('error', reject)
    })
}

async function main() {
    console.log('Fetching latest release info for', `${owner}/${repo}`)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`
    const release = await getJson(apiUrl)

    if (!release || !Array.isArray(release.assets)) {
        throw new Error('Release or assets not found')
    }

    // Find assets that look like single-thread builds (contain ST or st in name)
    const jsAsset = release.assets.find(a => /\bst\b|_st|-st|st[._-]/i.test(a.name) && a.name.endsWith('.js'))
        || release.assets.find(a => a.name.endsWith('.js'))
    const wasmAsset = release.assets.find(a => /\bst\b|_st|-st|st[._-]/i.test(a.name) && a.name.endsWith('.wasm'))
        || release.assets.find(a => a.name.endsWith('.wasm'))

    if (!jsAsset || !wasmAsset) {
        console.error('Could not find suitable js/.wasm assets in release. Please download ST build manually from', release.html_url)
        process.exit(1)
    }

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

    const jsDest = path.join(outDir, jsAsset.name)
    const wasmDest = path.join(outDir, wasmAsset.name)

    console.log('Downloading', jsAsset.name)
    await download(jsAsset.browser_download_url, jsDest)
    console.log('Saved to', jsDest)

    console.log('Downloading', wasmAsset.name)
    await download(wasmAsset.browser_download_url, wasmDest)
    console.log('Saved to', wasmDest)

    console.log('\nDone. Place the following URLs into your extract7z call options:')
    console.log('  stJsUrl:', `/${path.relative(path.join(__dirname, '..'), jsDest).replace(/\\\\/g, '/')}`)
    console.log('  stWasmUrl:', `/${path.relative(path.join(__dirname, '..'), wasmDest).replace(/\\\\/g, '/')}`)
    console.log('\nThen run `pnpm run build` in the www folder.')
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
