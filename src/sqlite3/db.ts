import { join } from 'node:path'
import { Database } from 'node-sqlite3-wasm'
import { GameDao } from 'src/models/game'
import { RomDao } from '../models/rom'

let db!: Database

// 初始化数据库，需要传入插件的扩展路径
export function initDb(extensionPath: string): void {
    const dbPath = join(extensionPath, 'res/nes.sqlite3')
    try {

        db = new Database(dbPath, { fileMustExist: true })
    }
    catch(e) {
        console.error(e)
    }
}

// 获取ROM数据访问对象`
export function getRomDao(): RomDao {

    return new RomDao(db)
}

// 获取游戏数据访问对象
export function getGameDao(): GameDao {

    return new GameDao(db)
}
