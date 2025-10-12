import { basename, join } from 'node:path'
import os from 'node:os'
import { copyFileSync, writeFileSync } from 'node:fs'
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

export function activate(context: vscode.ExtensionContext) {
    const remoteROMTree = new RemoteRomTree()
    const localROMTree = new LocalRomTree()
    const remoteROMTreeData = vscode.window.registerTreeDataProvider('remoteROM', remoteROMTree)
    const localROMTreeData = vscode.window.registerTreeDataProvider('localROM', localROMTree)

    // 初始化数据库，传入插件扩展路径
    initDb(context.extensionPath)
    
    const gameDao = getGameDao()
    console.log('rpg', gameDao.getByType1('RPG'))

    let controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('vscodeNes.controller')) {
            controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')
            if (panel) {
                panel.webview.postMessage({ type: 'setController', controller })
            }
        }
    })

    let isDisposed = true
    let pendingPlayCommand: { lable: string; url: string; isLocal: boolean } | null = null
    
    const sendMessage = vscode.commands.registerCommand('vscodeNes.sendMessage', (message: string) => {
        vscode.window.showInformationMessage(message)
    })
    
    const playCommand = vscode.commands.registerCommand('vscodeNes.play', (lable: string, url: string) => {

        // 处理URL转换
        let isLocal = false
        if (!isUrl(url)) {
            isLocal = true
        }
        else if (lable in localRoms) {
            isLocal = true
            url = localRoms[lable]
        }
        
        if (isDisposed || !panel) {
            isDisposed = false

            // 暂存play命令，等webview准备好后再执行
            pendingPlayCommand = { lable, url, isLocal }
            
            setPanel(context)
            panel.webview.postMessage({ type: 'setController', controller })
            panel.onDidDispose(() => {
                isDisposed = true
                pendingPlayCommand = null
            })
            panel.webview.onDidReceiveMessage(data => {
                if (data.type === 'error') {
                    vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
                }
                else if (data.type === 'info') {
                    vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
                }
                else if (data.type === 'ready') {

                    // webview已准备就绪，执行待执行的play命令
                    if (pendingPlayCommand) {

                        // 在这里进行URL转换，确保panel已经创建
                        let finalUrl = pendingPlayCommand.url
                        if (!isUrl(finalUrl)) {
                            finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(finalUrl)).toString()
                        }
                        else if (pendingPlayCommand.lable in localRoms) {
                            finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(localRoms[pendingPlayCommand.lable])).toString()
                        }
                        
                        panel.webview.postMessage({ 
                            type: 'play', 
                            lable: pendingPlayCommand.lable,
                            url: finalUrl,
                            isLocal: pendingPlayCommand.isLocal,
                        })
                        pendingPlayCommand = null
                    }
                }
                else if (data.type === 'download') {
                    const userPath = join(os.homedir(), LOCAL_FOLDER)
                    const savePath = join(userPath, 'roms')
                    ensureExists(userPath)
                    ensureExists(savePath)
                    const filePath = join(savePath, data.fileName)
                    localRoms[data.fileName] = filePath
                    const rom = []
                    let i = 0
                    let byte = data.content.charCodeAt(i)
                    while(!Number.isNaN(byte)) {
                        rom.push(byte)
                        i += 1
                        byte = data.content.charCodeAt(i)
                    }
                    writeFileSync(filePath, Buffer.from(rom))
                    saveLocalRoms(localRoms)
                    localROMTree.emitDataChange.call(localROMTree)
                    remoteROMTree.emitDataChange.call(remoteROMTree)
                }
            })
        }
        else {
            panel.reveal()
            
            // 如果webview已经存在，转换URL并直接发送play消息
            let finalUrl = url
            if (!isUrl(url)) {
                finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(url)).toString()
            }
            else if (lable in localRoms) {
                finalUrl = panel.webview.asWebviewUri(vscode.Uri.file(localRoms[lable])).toString()
            }
            
            panel.webview.postMessage({ type: 'play', lable, url: finalUrl, isLocal })
        }
    })
    const addRomDispose = vscode.commands.registerCommand('vscodeNes.add', async() => {
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
                saveLocalRoms(localRoms)
            })
            localROMTree.emitDataChange.call(localROMTree)
        }
    })
    const removeRomDispose = vscode.commands.registerCommand('vscodeNes.remove', item => {
        removeRom(item.label)
        localROMTree.emitDataChange.call(localROMTree)
        remoteROMTree.emitDataChange.call(remoteROMTree)
        if (panel) {
            panel.webview.postMessage({ type: 'delete', lable: item.label })
        }
    })
    const likeRomDispose = vscode.commands.registerCommand('vscodeNes.like', item => {
        
        remoteROMTree.addLike(item.label, item.tooltip)
    })
    const dislikeRomDispose = vscode.commands.registerCommand('vscodeNes.dislike', item => {
        
        remoteROMTree.removeLike(item.label)
    })

    context.subscriptions.push(remoteROMTreeData)
    context.subscriptions.push(localROMTreeData)
    context.subscriptions.push(playCommand)
    context.subscriptions.push(sendMessage)
    context.subscriptions.push(addRomDispose)
    context.subscriptions.push(removeRomDispose)
    context.subscriptions.push(likeRomDispose)
    context.subscriptions.push(dislikeRomDispose)
}

export function deactivate(context: vscode.ExtensionContext) {
    context.subscriptions.forEach(d => d.dispose())
}
