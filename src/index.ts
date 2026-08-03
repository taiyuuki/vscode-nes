import { basename, join } from 'node:path'
import os from 'node:os'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import * as vscode from 'vscode'
import { LOCAL_FOLDER, ensureExists, getHtml, localRoms, removeRom, saveLocalRoms } from './utils'
import { LocalRomTree } from './romTree'
import { getGameDao, initDb } from './sqlite3/db'
import type { ControlCode } from './net'
import { NetManager } from './net'

class PanelManager {
    panel:           vscode.WebviewPanel | null = null
    messageHandlers: Map<string, ((data: any) => void)[]> = new Map()

    constructor(private context: vscode.ExtensionContext) {}

    setPanel() {
        this.panel = vscode.window.createWebviewPanel('vscode-nes', '红白机模拟器', vscode.ViewColumn.One, {
            enableScripts:           true,
            retainContextWhenHidden: true,
            localResourceRoots:      [
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

    registerMessageHandler(type: string, handler: (data: any) => void) {
        const handlers = this.messageHandlers.get(type) || []
        handlers.push(handler)
        this.messageHandlers.set(type, handlers)
    }

    onDidDispose(callback: () => void) {
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
            enableScripts:      true,
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
                    keyword:  (msg.keyword || '').trim(),
                    type1:    (msg.type1 || 'all').trim().toLowerCase(),
                    page:     msg.page || 1,
                    pageSize: msg.pageSize || 10,
                    orderBy:  msg.orderBy || 'name_cn',
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
        keyword:  string
        type1:    string
        page:     number
        pageSize: number
        orderBy:  string
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
                type:  'play',
                label: filename,
                url:   panelManager.panel!.webview.asWebviewUri(vscode.Uri.file(filePath)).toString(),
                local: true,
            })
        }
        else if (game) {
            panelManager.postMessage({
                type:  'openROM',
                rom:   filename.replace('.nes', '.7z'),
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
        panelManager.postMessage({ type: 'setController', controller })
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
            canSelectFiles:   true,
            canSelectFolders: false,
            canSelectMany:    true,
            filters:          { nes: ['nes', 'nsf'] },
            defaultUri:       vscode.Uri.file('D:\\'),
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

    // ============ 联机（局域网双人） ============
    setupNetcode(context)
}

/**
 * 联机功能：NetManager 实例 + 命令 + 与 webview 的消息桥接
 *
 * - NetManager 负责扩展端之间的 TCP 连接与协议编解码
 * - src/index.ts 在 NetManager 回调 ↔ webview 之间做 postMessage 转发
 */
function setupNetcode(context: vscode.ExtensionContext): void {
    const netManager = new NetManager(

        // 收到对端消息 → 转发给 webview
        {
            onInput:   (frame, input) => panelManager.postMessage({ type: 'net-recv', kind: 'input', frame, input }),
            onSave:    saveState => panelManager.postMessage({ type: 'net-recv', kind: 'save', saveState: Array.from(saveState) }),
            onControl: code => panelManager.postMessage({ type: 'net-recv', kind: 'control', code }),
            onRom:     (name, rom) => panelManager.postMessage({ type: 'net-recv', kind: 'rom', name, rom: Array.from(rom) }),
        },

        // 连接状态变化 → 转发给 webview
        { onStateChange: (state, reason) => panelManager.postMessage({ type: 'net-state', state, reason }) },
    )

    // ---- webview → 扩展端：联机消息桥 ----
    panelManager.registerMessageHandler('net-create-room', async data => {
        const localPlayer: 1 | 2 = data.localPlayer === 2 ? 2 : 1
        try {
            const port = await netManager.createRoom(localPlayer, data.port || 0)
            panelManager.postMessage({ type: 'net-room-created', port, localPlayer })
            vscode.window.showInformationMessage(`房间已创建，端口 ${port}，等待对手加入…`)
        }
        catch(err) {
            vscode.window.showErrorMessage(`创建房间失败: ${(err as Error).message}`)
        }
    })

    panelManager.registerMessageHandler('net-join-room', async data => {
        const localPlayer: 1 | 2 = data.localPlayer === 2 ? 2 : 1
        try {
            await netManager.joinRoom(data.host, data.port, localPlayer)
            panelManager.postMessage({ type: 'net-connected', localPlayer, peerPlayer: localPlayer === 1 ? 2 : 1 })
            vscode.window.showInformationMessage(`已连接到 ${data.host}:${data.port}`)
        }
        catch(err) {
            vscode.window.showErrorMessage(`加入房间失败: ${(err as Error).message}`)
        }
    })

    panelManager.registerMessageHandler('net-send', data => {
        switch(data.kind) {
            case 'input':
                netManager.sendInput(data.frame, data.input)
                break
            case 'save':
                netManager.sendSaveState(new Uint8Array(data.saveState))
                break
            case 'control':
                netManager.sendControl(data.code as ControlCode)
                break
            case 'rom':
                netManager.sendRom(data.name, new Uint8Array(data.rom))
                break
        }
    })

    panelManager.registerMessageHandler('net-close', () => {
        netManager.close()
    })

    // ---- 命令：创建房间 / 加入房间 / 离开房间 ----
    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.createRoom', async() => {
        if (!ensurePanelOpen()) return

        const playerPick = await vscode.window.showQuickPick(
            [
                { label: '玩家 1 (P1)', description: '本地控制 1P', value: 1 as 1 | 2 },
                { label: '玩家 2 (P2)', description: '本地控制 2P', value: 2 as 1 | 2 },
            ],
            { placeHolder: '选择你的本地玩家号' },
        )
        if (!playerPick) return

        const portInput = await vscode.window.showInputBox({
            prompt:        '监听端口（留空或 0 = 随机端口）',
            placeHolder:   '例如 19890',
            validateInput: v => {
                if (!v) return null
                const n = Number(v)
                if (!Number.isInteger(n) || n < 0 || n > 65535) return '请输入 0-65535 的整数'

                return null
            },
        })
        const port = portInput ? Number(portInput) : 0

        try {
            const actualPort = await netManager.createRoom(playerPick.value, port)
            panelManager.postMessage({ type: 'net-room-created', port: actualPort, localPlayer: playerPick.value })
            vscode.window.showInformationMessage(`房间已创建！端口 ${actualPort}，请把 IP:端口告诉对手。`)
        }
        catch(err) {
            vscode.window.showErrorMessage(`创建房间失败: ${(err as Error).message}`)
        }
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.joinRoom', async() => {
        if (!ensurePanelOpen()) return

        const playerPick = await vscode.window.showQuickPick(
            [
                { label: '玩家 1 (P1)', description: '本地控制 1P', value: 1 as 1 | 2 },
                { label: '玩家 2 (P2)', description: '本地控制 2P', value: 2 as 1 | 2 },
            ],
            { placeHolder: '选择你的本地玩家号' },
        )
        if (!playerPick) return

        const addr = await vscode.window.showInputBox({
            prompt:        '输入对手的地址（host:port）',
            placeHolder:   '例如 192.168.1.100:19890',
            validateInput: v => {
                const m = v.trim().match(/^(.+):(\d+)$/)
                if (!m) return '格式应为 host:port'
                const p = Number(m[2])
                if (!Number.isInteger(p) || p < 1 || p > 65535) return '端口必须是 1-65535'

                return null
            },
        })
        if (!addr) return

        const [host, portStr] = addr.trim().split(':')
        const port = Number(portStr)

        try {
            await netManager.joinRoom(host, port, playerPick.value)
            panelManager.postMessage({ type: 'net-connected', localPlayer: playerPick.value, peerPlayer: playerPick.value === 1 ? 2 : 1 })
            vscode.window.showInformationMessage(`已连接到 ${host}:${port}`)
        }
        catch(err) {
            vscode.window.showErrorMessage(`加入房间失败: ${(err as Error).message}`)
        }
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscodeNes.leaveRoom', () => {
        netManager.close()
        vscode.window.showInformationMessage('已断开联机')
    }))

    context.subscriptions.push({ dispose: () => netManager.dispose() })
}

/**
 * 确保游戏面板已打开（联机命令需要它作为消息收发端）
 */
function ensurePanelOpen(): boolean {
    if (panelManager.panel) {
        panelManager.panel.reveal()

        return true
    }
    vscode.window.showWarningMessage('请先打开红白机模拟器面板（运行游戏），再使用联机功能。')

    return false
}

export function deactivate(context: vscode.ExtensionContext) {
    context.subscriptions.forEach(d => d.dispose())
}
