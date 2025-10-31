import { basename, join } from 'node:path'
import os from 'node:os'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
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
        this.panel.onDidChangeViewState(e => {
            this.panel?.webview.postMessage({ type: 'changeViewState', visible: e.webviewPanel.visible })
            
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

    constructor(private readonly extensionCtxt: vscode.ExtensionContext) {}

    resolveWebviewView(view: vscode.WebviewView) {
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(this.extensionCtxt.extensionPath, 'res'))],
        }

        view.webview.html = this.loadHtml()
        let payload: { game: string | null, rom: string | null } | null = null

        panelManager.registerMessageHandler('ready', () => {
            if (payload?.rom) {

                this.play(payload.rom, payload.game)
                payload = null
            }
        })

        view.webview.onDidReceiveMessage(msg => {
            if (msg.type === 'search') {
                const pageData = this.search({
                    keyword: (msg.keyword || '').trim(),
                    type1: (msg.type1 || 'all').trim().toLowerCase(),
                    page: msg.page || 1,
                    pageSize: msg.pageSize || 10,
                    orderBy: msg.orderBy || 'name_cn',
                    orderDir: msg.orderDir || 'ASC',
                })
                
                view.webview.postMessage({ type: 'results', keyword: (msg.keyword || '').trim(), ...pageData })
            }
            else if (msg.type === 'openROM') {

                if (panelManager.panel) {

                    this.play(msg.rom, msg.game)
                }
                else {
                    panelManager.setPanel()
                    payload = { game: msg.game, rom: msg.rom }
                }
            }
        })
    }

    private search(options: {
        keyword: string
        type1: string
        page: number
        pageSize: number
        orderBy: string
        orderDir: 'ASC' | 'DESC'
    }) {
        const keyword = options.keyword.trim()
        const type1 = options.type1.trim().toLowerCase()
        const page = options.page || 1
        const pageSize = options.pageSize || 10
        const orderBy = options.orderBy || 'name_cn'
        const orderDir = options.orderDir || 'ASC'

        return this.gameDao.search({ name: keyword, type1, page, pageSize, orderBy, orderDir })
    }

    private play(filename: string, game?: any) {
        const filePath = localRoms[filename]
        if (filePath && existsSync(filePath)) {
            panelManager.postMessage({
                type: 'play',
                label: filename,
                url: panelManager.panel!.webview.asWebviewUri(vscode.Uri.file(filePath)).toString(),
                local: true,
            })
        }
        else if (game) {
            panelManager.postMessage({
                type: 'openROM',
                rom: filename.replace('.nes', '.7z'),
                game,
                local: false,
            })
        }
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
            if (existsSync(url)) {
                const finalUrl = panelManager.panel!.webview.asWebviewUri(vscode.Uri.file(url)).toString()
                panelManager.postMessage({ type: 'play', label: payload.label, url: finalUrl, local: payload.isLocal })
            }
            else {
                vscode.commands.executeCommand('vscodeNes.sendMessage', '文件已不存在')
            }
  
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

            if (existsSync(url)) {
                const finalUrl = panelManager.panel.webview.asWebviewUri(vscode.Uri.file(url)).toString()
                panelManager.postMessage({ type: 'play', label, url: finalUrl, local: true })
            }
            else {
                vscode.commands.executeCommand('vscodeNes.sendMessage', '文件已不存在')
            }
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
