import * as vscode from 'vscode'
import { getHtml, isUrl, removeRom, saveLocalRoms } from './utils'
import { RemoteRomTree, LocalRomTree } from './romTree'
import { join } from 'path'
import os from 'os'

let panel!: vscode.WebviewPanel

function setPanel(context: vscode.ExtensionContext) {
  panel = vscode.window.createWebviewPanel('vscode-nes', '红白机模拟器', vscode.ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [
      vscode.Uri.file(join(os.homedir(), 'vscode.nes')),
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

  let controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('vscodeNes.controller')) {
      controller = vscode.workspace.getConfiguration('vscodeNes').get('controller')
      panel && panel.webview.postMessage({ controller })
    }
  })

  let isDisposed = true
  const sendMessage = vscode.commands.registerCommand('vscodeNes.sendMessage', (message: string) => {
    vscode.window.showInformationMessage(message)
  })
  const playCommand = vscode.commands.registerCommand('vscodeNes.play', (lable: string, url: string) => {
    if (isDisposed) {
      isDisposed = false
      setPanel(context)
      panel.webview.postMessage({ controller })
      panel.onDidDispose(() => {
        isDisposed = true
      })
      panel.webview.onDidReceiveMessage((data) => {
        if (data.type === 'error') {
          vscode.commands.executeCommand('vscodeNes.sendMessage', data.message)
        }
      })
    }
    if (!isUrl(url)) {
      url = panel.webview.asWebviewUri(vscode.Uri.file(url)).toString()
    }
    panel.webview.postMessage({ lable, url })
  })
  const addRomDispose = vscode.commands.registerCommand('vscodeNes.add', async () => {
    const files = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true,
      filters: { 'nes': ['nes'] },
      defaultUri: vscode.Uri.file('D:\\'),
    })

    if (files) {
      saveLocalRoms(files)
      localROMTree.emitDataChange.call(localROMTree)
    }
  })
  const removeRomDispose = vscode.commands.registerCommand('vscodeNes.remove', (item) => {
    removeRom(item.label)
    localROMTree.emitDataChange.call(localROMTree)
  })
  context.subscriptions.push(remoteROMTreeData)
  context.subscriptions.push(localROMTreeData)
  context.subscriptions.push(playCommand)
  context.subscriptions.push(sendMessage)
  context.subscriptions.push(addRomDispose)
  context.subscriptions.push(removeRomDispose)
}

export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((d) => d.dispose())
}