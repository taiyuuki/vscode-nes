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

    search(options: {
        name: string
        type1: string
        page: number
        pageSize: number
        orderBy?: string
        orderDir?: 'ASC' | 'DESC'
    }) {
        const { name, type1, page, pageSize, orderBy = 'name_cn', orderDir = 'DESC' } = options
        const qb = this.qb.reset()
        
        if (type1 !== 'all') {
            qb.whereRaw('LOWER(type1_en) = ?', [type1])
        }

        if (name.trim()) {
            const pattern = `%${name.trim().toLowerCase()}%`
            qb.whereRaw('LOWER(name_cn) LIKE ?', [pattern])
                .orWhereRaw('LOWER(name_en) LIKE ?', [pattern])
                .orWhereRaw('LOWER(name_jp) LIKE ?', [pattern])
        }
        qb.order(orderBy, orderDir)
        const total = qb.count()
        if (!total) return { results: [] as Game[], total: 0, totalPages: 0, page: 0, pageSize }
        const totalPages = Math.ceil(total / pageSize)
        const safePage = Math.min(Math.max(1, page), totalPages)
        const offset = (safePage - 1) * pageSize
        const results = qb
            .setLimit(pageSize, offset)
            .all<Game>()
            
        return { results, total, totalPages, page: safePage, pageSize }
    }
}
