import { join } from 'node:path'
import * as vscode from 'vscode'
import { RomGroupTreeItem, RomTreeItem } from './romTreeItem'
import { likesRoms, localRoms, objectKeys, saveLikes } from './utils'
import { baseURL, games, types } from './games'

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

export class RemoteRomTree implements vscode.TreeDataProvider<RomTreeItem> {
    private readonly _onChangeTreeData = new vscode.EventEmitter<RomTreeItem | undefined>()
    public readonly onDidChangeTreeData = this._onChangeTreeData.event
    public likes: Record<string, string>

    constructor() {
        this.likes = likesRoms
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('vscodeNes.romPath')) {
                this._onChangeTreeData.fire(void 0)
            }
        })
    }

    emitDataChange() {
        this._onChangeTreeData.fire(void 0)
    }

    addLike(title: string, url: string) {
        this.likes[title] = url
        this.emitDataChange()
        saveLikes(this.likes)
    }

    removeLike(title: string) {
        delete this.likes[title]
        this.emitDataChange()
        saveLikes(this.likes)
    }

    getChildren(element: RomGroupTreeItem | undefined) {

        if (element) {
            const result: RomTreeItem[] = []
            if (element.key === 'likes') {
                objectKeys(this.likes).forEach(key => {
                    result.push(new RomTreeItem(key, this.likes[key], 'likes', new vscode.ThemeIcon('heart')))
                })
            }
            else {
                games.filter(game => game.type === element.key).forEach(game => {
                    const icon = game.title in localRoms ? join(__dirname, '../res/nes-rom.svg') : new vscode.ThemeIcon('file')
                    result.push(new RomTreeItem(game.title, `${baseURL + game.title}.nes`, game.type, icon))
                })
            }

            return Promise.resolve(result)
        }
        else {
            const result: RomGroupTreeItem[] = []
            result.push(new RomGroupTreeItem('我的收藏', 'likes'))
            objectKeys(types).forEach(key => {
                result.push(new RomGroupTreeItem(types[key], key))
            })

            return Promise.resolve(result)
        }

        // return Promise.resolve(result)
    }

    getTreeItem(element: RomTreeItem): Thenable<vscode.TreeItem> | vscode.TreeItem {
        return element
    }
}
