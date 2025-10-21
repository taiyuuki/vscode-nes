import { basename, join } from 'node:path'
import os from 'node:os'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import * as vscode from 'vscode'
import { LOCAL_FOLDER, ensureExists, getHtml, localRoms, removeRom, saveLocalRoms } from './utils'
import { LocalRomTree } from './romTree'
import { getGameDao, initDb } from './sqlite3/db'

class PanelManager {
    panel: vscode.WebviewPanel | null = null
    messageHandlers: Map<string, ((data: any)=> void)[]> = new Map()

    constructor(private context: vscode.ExtensionContext) {}

    setPanel() {
        this.panel = vscode.window.createWebviewPanel('vscode-nes', '红白机模拟器', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(join(os.homedir(), LOCAL_FOLDER)),
                vscode.Uri.file(join(this.context.extensionPath, 'res')),
            ],
        })

        this.panel.webview.html = getHtml(this.context.extensionPath, this.panel)
        this.panel.iconPath = vscode.Uri.file(join(this.context.extensionPath, 'res/famicom.svg'))
    
        this.panel.webview.onDidReceiveMessage(e => {
            const handlers = this.messageHandlers.get(e.type)
            if (handlers) {
                handlers.forEach(handler => handler(e))
            }
        })
        this.panel.onDidDispose(() => this.panel = null)
        this.context.subscriptions.push(this.panel)
    }

    postMessage(message: any) {
        if (this.panel) {
            this.panel.webview.postMessage(message)
        }
    }

    registerMessageHandler(type: string, handler: (data: any)=> void) {
        const handlers = this.messageHandlers.get(type) || []
        handlers.push(handler)
        this.messageHandlers.set(type, handlers)
    }

    onDidDispose(callback: ()=> void) {
        if (this.panel) {
            this.panel.onDidDispose(callback)
        }
    }
}

let panelManager!: PanelManager

class SearchWebviewProvider implements vscode.WebviewViewProvider {
    gameDao = getGameDao()
    private lastKeyword = ''
    private pageSize = 10

    constructor(private readonly extensionCtxt: vscode.ExtensionContext) {}

    resolveWebviewView(view: vscode.WebviewView) {
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(this.extensionCtxt.extensionPath, 'res'))],
        }

        view.webview.html = this.loadHtml()
        let payload: { game: string | null, rom: string | null, local: boolean } | null = null

        panelManager.registerMessageHandler('ready', () => {
            if (payload) {
                panelManager.postMessage({ type: 'openROM', ...payload })
                payload = null
            }
        })

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
                let romURL = msg.rom
                const label = msg.rom.replace('.7z', '.nes')
                const local = !!localRoms[label]
                if (local) {
                    romURL = panelManager.panel!.webview.asWebviewUri(vscode.Uri.file(localRoms[label])).toString()
                }
                
                if (panelManager.panel) {

                    panelManager.postMessage({ type: 'openROM', game: msg.game, rom: romURL, local })
                }
                else {
                    panelManager.setPanel()
                    payload = { game: msg.game, rom: romURL, local }
                }
            }
        })
    }

    private searchPaged(kw: string, type1: string, page: number) {

        const { list, total, totalPages, page: realPage, pageSize } = this.gameDao.searchByNamePaged(kw, type1, page, this.pageSize)

        return { results: list, page: realPage, pageSize, total, totalPages }
    }

    private loadHtml() {
        const p = join(this.extensionCtxt.extensionPath, 'res', 'search.html')
        try {
            return readFileSync(p, 'utf8').replace(/__NONCE__/g, getNonce())
        }
        catch(e) {
            return `<html><body>缺少 search.html: ${(e as Error).message}</body></html>`
        }
    }
}

function getNonce() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function activate(context: vscode.ExtensionContext) {

    initDb(context.extensionPath)
    panelManager = new PanelManager(context)

    const localROMTree = new LocalRomTree()
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('vscodeNes.localROM', localROMTree),
        vscode.window.registerWebviewViewProvider('vscodeNes.searchROM', new SearchWebviewProvider(context)),
    )

    let controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('vscodeNes.controller')) {
            controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')

            panelManager.postMessage({ type: 'setController', controller })
        }
    })

    let payload: { label: string; url: string; isLocal: boolean } | null = null

    panelManager.registerMessageHandler('error', data => {
        vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
    })
    panelManager.registerMessageHandler('info', data => {
        vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
    })
    panelManager.registerMessageHandler('ready', () => {
        if (payload) {
            panelManager.panel?.reveal()
            let url = payload.url
            if (payload.label in localRoms) {
                url = localRoms[payload.label]
            }
            const finalUrl = panelManager.panel!.webview.asWebviewUri(vscode.Uri.file(url)).toString()
  
            panelManager.postMessage({ type: 'play', label: payload.label, url: finalUrl, isLocal: payload.isLocal })
            payload = null
        }
    })
    panelManager.registerMessageHandler('download', data => {
        const userPath = join(os.homedir(), LOCAL_FOLDER)
        const savePath = join(userPath, 'roms')
        ensureExists(userPath)
        ensureExists(savePath)
        const filePath = join(savePath, data.filename)
        localRoms[data.filename] = filePath

        // const rom: number[] = []
        // for (let i = 0; i < data.content.length; i++) rom.push(data.content.charCodeAt(i))
        writeFileSync(filePath, Buffer.from(data.content, 'binary'))
        saveLocalRoms(localRoms)
        localROMTree.emitDataChange.call(localROMTree)
    })

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.sendMessage', (m: string) => {
        vscode.window.showInformationMessage(m)
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.play', (label: string, url: string) => {
        if (panelManager.panel) {
            panelManager.panel.reveal()
            if (label in localRoms) {
                url = localRoms[label]
            }
            const finalUrl = panelManager.panel.webview.asWebviewUri(vscode.Uri.file(url)).toString()
            panelManager.postMessage({ type: 'play', label, url: finalUrl, isLocal: true })
        }
        else {
            payload = { label, url, isLocal: true }
            panelManager.setPanel()
            panelManager.onDidDispose(() => {
                payload = null
            })
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

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.remove', item => {
        removeRom(item.label)
        localROMTree.emitDataChange.call(localROMTree)

        panelManager.postMessage({ type: 'delete', label: item.label })
    }))
}

export function deactivate(context: vscode.ExtensionContext) {
    context.subscriptions.forEach(d => d.dispose())
}
