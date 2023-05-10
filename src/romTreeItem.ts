import * as vscode from 'vscode'

export class RootItem extends vscode.TreeItem {
  constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded)
  }
}

export class RomTreeItem extends vscode.TreeItem {
  constructor(label: string, url: string, icon: vscode.ThemeIcon | string) {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.command = {
      title: 'Play Game',
      command: 'vscodeNes.play',
      arguments: [label, url],
    }
    this.tooltip = url
    this.iconPath = icon
  }
}