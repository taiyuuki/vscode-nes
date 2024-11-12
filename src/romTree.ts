import { join } from 'node:path'
import * as vscode from 'vscode'
import { RomGroupTreeItem, RomTreeItem } from './romTreeItem'
import { localRoms, objectKeys } from './utils'
import { baseURL, games, types } from './games'

type RomInfo = [string, string]

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
            result.push(new RomTreeItem(key, localRoms[key], new vscode.ThemeIcon('file')))
        })

        return Promise.resolve(result)
    }
}

export class RemoteRomTree implements vscode.TreeDataProvider<RomTreeItem> {
    private readonly _onChangeTreeData = new vscode.EventEmitter<RomTreeItem | undefined>()
    public readonly onDidChangeTreeData = this._onChangeTreeData.event

    constructor() {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('vscodeNes.romPath')) {
                this._onChangeTreeData.fire(void 0)
            }
        })
    }

    emitDataChange() {
        this._onChangeTreeData.fire(void 0)
    }

    getChildren(element: RomGroupTreeItem | undefined): Thenable<RomTreeItem[]> {

        // const roms = vscode.workspace.getConfiguration('vscodeNes').get('romPath') as RomInfo[]
        // const result: RomTreeItem[] = []
        // roms.forEach(rom => {
        //     result.push(new RomTreeItem(rom[0], rom[1], join(__dirname, '../res/nes-rom.svg')))
        // })
        // result.push(new RomTreeItem('雪人兄弟', 'https://gitee.com/taiyuuki/nes-roms/raw/main/%E9%9B%AA%E4%BA%BA%E5%85%84%E5%BC%9F', join(__dirname, '../res/nes-rom.svg')))
        if (element) {
            const result: RomTreeItem[] = []
            if (element.key) {
                games.filter(game => game.type === element.key).forEach(game => {
                    result.push(new RomTreeItem(game.title, baseURL + game.title, join(__dirname, '../res/nes-rom.svg')))
                })
            }

            return Promise.resolve(result)
        }
        else {
            const result: RomGroupTreeItem[] = []
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
