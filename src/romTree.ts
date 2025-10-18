import { join } from 'node:path'
import * as vscode from 'vscode'
import { RomTreeItem } from './romTreeItem'
import { localRoms } from './utils'

export class LocalRomTree implements vscode.TreeDataProvider<RomTreeItem> {
    private readonly _onChangeTreeData = new vscode.EventEmitter<RomTreeItem | undefined>()
    public readonly onDidChangeTreeData = this._onChangeTreeData.event

    emitDataChange() {
        this._onChangeTreeData.fire(void 0)
    }

    getTreeItem(element: RomTreeItem): Thenable<vscode.TreeItem> | vscode.TreeItem {
        return element
    }

    getChildren(): Thenable<RomTreeItem[]> {
        const list = Object.keys(localRoms)
        if (list.length === 0) {
            return Promise.resolve([])
        }
        const result: RomTreeItem[] = []
        list.forEach(key => {
            result.push(new RomTreeItem(key, localRoms[key], 'local', join(__dirname, '../res/nes-rom.svg')))
        })

        return Promise.resolve(result)
    }
}

