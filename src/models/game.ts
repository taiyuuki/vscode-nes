import type { Database } from 'node-sqlite3-wasm'
import { QueryBuilder } from 'src/sqlite3/queryBuilder'

export interface Game {
    id: number
    copyright: string
    copyright_en: string
    platform: string
    name_en: string
    name_cn: string
    name_jp: string
    type1: string
    type1_en: string
    type2: string
    type2_en: string
    company: string
    release0: string
    roms: string
}

export class GameDao {
    private tableName = 'game'
    private qb: QueryBuilder

    constructor(db: Database) {
        this.qb = new QueryBuilder(db, this.tableName)
    }

    getAll(): Game[] {
        return this.qb
            .select('*')
            .all<Game>()
    }

    getById(id: number): Game | null {
        return this.qb
            .where('id', '=', id)
            .get<Game>()
    }

    getByType1(type1_en: string): Game[] {
        return this.qb
            .where('type1_en', '=', type1_en)
            .order('name_cn', 'ASC')
            .all<Game>()
    }

    searchByName(name: string): Game[] {
        return this.qb
            .whereLike('name_cn', name)
            .whereLike('name_en', name)
            .whereLike('name_jp', name)
            .order('name_cn', 'ASC')
            .all<Game>()
    }
}
