import { basename, join } from 'node:path'
import os from 'node:os'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import * as vscode from 'vscode'
import { LOCAL_FOLDER, ensureExists, getHtml, isUrl, localRoms, removeRom, saveLocalRoms } from './utils'
import { LocalRomTree, RemoteRomTree } from './romTree'
import { getGameDao, initDb } from './sqlite3/db'

let panel!: vscode.WebviewPanel

function setPanel(context: vscode.ExtensionContext) {
    panel = vscode.window.createWebviewPanel('vscode-nes', '红白机模拟器', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
            vscode.Uri.file(join(os.homedir(), LOCAL_FOLDER)),
            vscode.Uri.file(join(context.extensionPath, 'res')),
        ],
    })
    panel.webview.html = getHtml(context.extensionPath, panel)
    panel.iconPath = vscode.Uri.file(join(context.extensionPath, 'res/famicom.svg'))
    context.subscriptions.push(panel)
}

class SearchWebviewProvider implements vscode.WebviewViewProvider {
    gameDao = getGameDao()
    private lastKeyword = ''
    private pageSize = 10

    constructor(private readonly extensionPath: string) {}

    resolveWebviewView(view: vscode.WebviewView) {
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(this.extensionPath, 'res'))],
        }

        view.webview.html = this.loadHtml()

        view.webview.onDidReceiveMessage(msg => {
            if (msg.type === 'search') {
                const type1: string = (msg.type1 || 'all').trim().toLowerCase()
                const kw: string = (msg.keyword || '').trim()
                this.lastKeyword = kw

                // 处理 pageSize（允许 5/10/20/50，自定义时夹到 1..100）
                if (msg.pageSize) {
                    const ps = Number(msg.pageSize) || 10
                    const allowed = [5, 10, 20, 50]
                    this.pageSize = allowed.includes(ps) ? ps : Math.min(100, Math.max(1, ps))
                }
                const pageData = this.searchPaged(kw, type1, 1)
                view.webview.postMessage({ type: 'results', keyword: kw, ...pageData })
            }
            else if (msg.type === 'page') {
                const type1: string = (msg.type1 || 'all').trim().toLowerCase()
                const reqPage = msg.page || 1
                const pageData = this.searchPaged(this.lastKeyword, type1, reqPage)
                view.webview.postMessage({ type: 'results', keyword: this.lastKeyword, ...pageData })
            }
            else if (msg.type === 'openROM') {
                if (panel) {
                    panel.webview.postMessage({ type: 'openROM', game: msg.game, rom: msg.rom })
                }
            }
        })
    }

    private searchPaged(kw: string, type1: string, page: number) {

        const { list, total, totalPages, page: realPage, pageSize } = this.gameDao.searchByNamePaged(kw, type1, page, this.pageSize)

        // const results = list.map(g => {
        //     const names = g.name_cn.split('；')
        //     let name = names[0]
        //     if (kw && !name.includes(kw)) {
        //         const subname = names.find(n => n.includes(kw))
        //         if (subname) name += ` (${subname})`
        //     }

        //     return { name, roms: JSON.parse(g.roms) as string[] }
        // })

        return { results: list, page: realPage, pageSize, total, totalPages }
    }

    private loadHtml() {
        const p = join(this.extensionPath, 'res', 'search.html')
        try {
            return readFileSync(p, 'utf8').replace(/__NONCE__/g, getNonce())
        }
        catch(e) {
            return `<html><body>缺少 search.html: ${(e as Error).message}</body></html>`
        }
    }

    // 内存分页逻辑已移除，改为数据库分页
}

function getNonce() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function activate(context: vscode.ExtensionContext) {

    initDb(context.extensionPath)

    const remoteROMTree = new RemoteRomTree()
    const localROMTree = new LocalRomTree()
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('vscodeNes.remoteROM', remoteROMTree),
        vscode.window.registerTreeDataProvider('vscodeNes.localROM', localROMTree),
        vscode.window.registerWebviewViewProvider('vscodeNes.searchROM', new SearchWebviewProvider(context.extensionPath)),
    )

    let controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('vscodeNes.controller')) {
            controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')
            if (panel) panel.webview.postMessage({ type: 'setController', controller })
        }
    })

    let isDisposed = true
    let pendingPlay: { lable: string; url: string; isLocal: boolean } | null = null

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.sendMessage', (m: string) => {
        vscode.window.showInformationMessage(m)
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.play', (lable: string, url: string) => {
        let isLocal = false
        if (!isUrl(url)) isLocal = true
        else if (lable in localRoms) { isLocal = true; url = localRoms[lable] }
        if (isDisposed || !panel) {
            isDisposed = false
            pendingPlay = { lable, url, isLocal }
            setPanel(context)
            panel.webview.postMessage({ type: 'setController', controller })
            panel.onDidDispose(() => { isDisposed = true; pendingPlay = null })
            panel.webview.onDidReceiveMessage(data => {
                if (data.type === 'error' || data.type === 'info') {
                    vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
                }
                else if (data.type === 'ready' && pendingPlay) {
                    let finalUrl = pendingPlay.url
                    if (!isUrl(finalUrl)) finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(finalUrl)).toString()
                    else if (pendingPlay.lable in localRoms) finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(localRoms[pendingPlay.lable])).toString()
                    panel.webview.postMessage({ type: 'play', lable: pendingPlay.lable, url: finalUrl, isLocal: pendingPlay.isLocal })
                    pendingPlay = null
                }
                else if (data.type === 'download') {
                    const userPath = join(os.homedir(), LOCAL_FOLDER)
                    const savePath = join(userPath, 'roms')
                    ensureExists(userPath)
                    ensureExists(savePath)
                    const filePath = join(savePath, data.fileName)
                    localRoms[data.fileName] = filePath
                    const rom: number[] = []
                    for (let i = 0; i < data.content.length; i++) rom.push(data.content.charCodeAt(i))
                    writeFileSync(filePath, Buffer.from(rom))
                    saveLocalRoms(localRoms)
                    localROMTree.emitDataChange.call(localROMTree)
                    remoteROMTree.emitDataChange.call(remoteROMTree)
                }
            })
        }
        else {
            panel.reveal()
            let finalUrl = url
            if (!isUrl(url)) finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(url)).toString()
            else if (lable in localRoms) finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(localRoms[lable])).toString()
            panel.webview.postMessage({ type: 'play', lable, url: finalUrl, isLocal })
        }
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.add', async() => {
        const files = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            filters: { nes: ['nes', 'nsf'] },
            defaultUri: vscode.Uri.file('D:\\'),
        })
        if (files) {
            const userPath = join(os.homedir(), LOCAL_FOLDER)
            const savePath = join(userPath, 'roms')
            ensureExists(userPath)
            ensureExists(savePath)
            files.forEach(file => {
                const filePath = join(savePath, basename(file.fsPath))
                localRoms[basename(file.fsPath)] = filePath
                copyFileSync(file.fsPath, filePath)
            })
            saveLocalRoms(localRoms)
            localROMTree.emitDataChange.call(localROMTree)
        }
    }))

    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeNes.remove', item => {
            removeRom(item.label)
            localROMTree.emitDataChange.call(localROMTree)
            remoteROMTree.emitDataChange.call(remoteROMTree)
            if (panel) panel.webview.postMessage({ type: 'delete', lable: item.label })
        }),
        vscode.commands.registerCommand('vscodeNes.like', item => { remoteROMTree.addLike(item.label, item.tooltip) }),
        vscode.commands.registerCommand('vscodeNes.dislike', item => { remoteROMTree.removeLike(item.label) }),
    )
}

export function deactivate(context: vscode.ExtensionContext) {
    context.subscriptions.forEach(d => d.dispose())
}
