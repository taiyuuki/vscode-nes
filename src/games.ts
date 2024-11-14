import games from './games.json'

const types = {
    ACT: '动作游戏',
    STG: '射击游戏',
    RPG: '角色扮演',
    SPG: '运动游戏',
    SLG: '策略游戏',
    FTG: '格斗游戏',
    AVG: '冒险解迷',
    PUZ: '益智游戏',
    RAC: '赛车竞赛',
    TAB: '桌面平台',
    ETC: '其他游戏',
}

const baseURL = 'https://taiyuuki.github.io/vscode-nes/games/'

export { games, types, baseURL }
