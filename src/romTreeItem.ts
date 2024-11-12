import * as vscode from 'vscode'

export class RomTreeItem extends vscode.TreeItem {

    key: string

    constructor(label: string, url: string, key: string, icon: vscode.ThemeIcon | string) {
        super(label, vscode.TreeItemCollapsibleState.None)
        this.command = {
            title: 'Play Game',
            command: 'vscodeNes.play',
            arguments: [label, url],
        }
        this.key = key
        this.tooltip = url
        this.iconPath = icon
        if (key === 'likes') {
            this.contextValue = 'likes'
        }
        else {
            this.contextValue = 'remoteROM'
        }
    }
}

export class RomGroupTreeItem extends vscode.TreeItem {
    constructor(label: string, public key: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed)
    }
}
