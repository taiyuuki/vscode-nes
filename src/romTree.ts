import { join } from 'path'
import * as vscode from 'vscode'
import { RomTreeItem } from './romTreeItem'
import { localRoms } from './utils'

type RomInfo = [string, string]

export class LocalRomTree implements vscode.TreeDataProvider<RomTreeItem> {
  private readonly _onChangeTreeData = new vscode.EventEmitter<RomTreeItem | undefined>()
  public readonly onDidChangeTreeData = this._onChangeTreeData.event

  emitDataChange() {
    this._onChangeTreeData.fire(void 0)
  }

  getTreeItem(element: RomTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(): Thenable<RomTreeItem[]> {
    const list = Object.keys(localRoms)
    if (list.length === 0) {
      return Promise.resolve([])
    }
    const result: RomTreeItem[] = []
    list.forEach(key => {
      result.push(new RomTreeItem(key, localRoms[key], new vscode.ThemeIcon('file')))
    })
    return Promise.resolve(result)
  }
}

export class RemoteRomTree implements vscode.TreeDataProvider<RomTreeItem> {
  private readonly _onChangeTreeData = new vscode.EventEmitter<RomTreeItem | undefined>()
  public readonly onDidChangeTreeData = this._onChangeTreeData.event
  constructor() {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('vscodeNes.romPath')) {
        this._onChangeTreeData.fire(void 0)
      }
    })
  }

  emitDataChange() {
    this._onChangeTreeData.fire(void 0)
  }

  getChildren(): Thenable<RomTreeItem[]> {
    const roms = vscode.workspace.getConfiguration('vscodeNes').get('romPath') as RomInfo[]
    const result: RomTreeItem[] = []
    roms.forEach(rom => {
      result.push(new RomTreeItem(rom[0], rom[1], join(__dirname, '../res/nes-rom.svg')))
    })
    return Promise.resolve(result)
  }

  getTreeItem(element: RomTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }
}