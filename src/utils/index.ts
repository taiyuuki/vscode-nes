import { existsSync, mkdirSync, readFileSync, unlink, writeFileSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'
import type { WebviewPanel } from 'vscode'
import { Uri } from 'vscode'

export const LOCAL_FOLDER = 'vscode.nes'
export const LOCAL_ROMS_FILENAME = 'local-roms.json'
export const LIKES_ROMS_FILENAME = 'likes.json'

export function isUrl(str: string) {
    const reg = /^https?.+?/g

    return reg.test(str)
}

export const localRoms: Record<string, string> = (function() {
    const metaPath = join(os.homedir(), LOCAL_FOLDER, LOCAL_ROMS_FILENAME)
    if (!_pathExists(metaPath)) {
        return {}
    }

    return JSON.parse(readFileSync(metaPath, 'utf-8'))
})()

export const likesRoms: Record<string, string> = (function() {
    const metaPath = join(os.homedir(), LOCAL_FOLDER, LIKES_ROMS_FILENAME)
    if (!_pathExists(metaPath)) {
        return {}
    }

    return JSON.parse(readFileSync(metaPath, 'utf-8'))
})()

export function getHtml(extentionPath: string, panel: WebviewPanel) {
    const reg = /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g
    let html = readFileSync(join(extentionPath, 'res/webview/index.html'), 'utf-8')
    let match = reg.exec(html)
    while (match) {
        html = html.replace(match[2], panel.webview.asWebviewUri(Uri.file(join(extentionPath, `res/webview/${match[2]}`))).toString())
        match = reg.exec(html)
    }

    return html
}

export function _pathExists(path: string) {
    return existsSync(path)
}

export function ensureExists(path: string) {
    if (!_pathExists(path)) {
        mkdirSync(path)
    }
}

export function saveLocalRoms(roms: Record<string, string>) {
    const userPath = join(os.homedir(), 'vscode.nes')

    writeFileSync(join(userPath, LOCAL_ROMS_FILENAME), JSON.stringify(roms, null, 2))
}

export function removeRom(name: string) {
    if (name in localRoms) {
        delete localRoms[name]
        writeFileSync(join(os.homedir(), 'vscode.nes', LOCAL_ROMS_FILENAME), JSON.stringify(localRoms, null, 2))
        unlink(join(os.homedir(), 'vscode.nes', 'roms', name), err => {
            if (err) {
                return
            }
        })
    }
}

export function saveLikes(likes: Record<string, string>) {
    writeFileSync(join(os.homedir(), 'vscode.nes', 'likes.json'), JSON.stringify(likes, null, 2))
}

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}
