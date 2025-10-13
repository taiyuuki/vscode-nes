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
    private db: Database

    constructor(db: Database) {
        this.db = db
        this.qb = new QueryBuilder(db, this.tableName)
    }

    getAll(): Game[] {
        return this.qb
            .reset()
            .select('*')
            .all<Game>()
    }

    getById(id: number): Game | null {
        return this.qb
            .reset()
            .where('id', '=', id)
            .get<Game>()
    }

    getByType1(type1_en: string): Game[] {
        return this.qb
            .reset()
            .where('type1_en', '=', type1_en)
            .order('name_cn', 'ASC')
            .all<Game>()
    }

    searchByName(name: string): Game[] {
        const kw = name.toLowerCase()
        const pattern = `%${kw}%`
        
        return this.qb
            .reset()
            .whereRaw('LOWER(name_cn) LIKE ?', [pattern])
            .orWhereRaw('LOWER(name_en) LIKE ?', [pattern])
            .orWhereRaw('LOWER(name_jp) LIKE ?', [pattern])
            .order('name_cn', 'ASC')
            .all<Game>()
    }

    searchByNamePaged(name: string, page: number, pageSize: number) {
        const kw = name.toLowerCase()
        const pattern = `%${kw}%`
        const qb = this.qb.reset()
            .whereRaw('LOWER(name_cn) LIKE ?', [pattern])
            .orWhereRaw('LOWER(name_en) LIKE ?', [pattern])
            .orWhereRaw('LOWER(name_jp) LIKE ?', [pattern])
        const total = qb.count()
        if (!total) return { list: [] as Game[], total: 0, totalPages: 0, page: 0, pageSize }
        const totalPages = Math.ceil(total / pageSize)
        const safePage = Math.min(Math.max(1, page), totalPages)
        const offset = (safePage - 1) * pageSize
        const list = qb
            .order('name_cn', 'ASC')
            .setLimit(pageSize, offset)
            .all<Game>()

        return { list, total, totalPages, page: safePage, pageSize }
    }
}
