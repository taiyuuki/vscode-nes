import type { Database } from 'node-sqlite3-wasm'
import { QueryBuilder } from 'src/sqlite3/queryBuilder'

// ROM数据模型
export interface Rom {
    id: number
    mapper: number
    filename: string
    gameid: number
}

export class RomDao {
    private tableName = 'rom'
    private qb: QueryBuilder 

    constructor(db: Database) {
        this.qb = new QueryBuilder(db, this.tableName)
    }

    /**
   * 获取所有ROM
   */
    getAll(): Rom[] {
        return this.qb
            .select('*')
            .all<Rom>()
    }

    /**
   * 根据game ID获取ROM
   */
    getById(gameid: number): Rom | null {
        return this.qb
            .where('gameid', '=', gameid)
            .get<Rom>()
    }

    /**
   * 根据Mapper类型获取ROM
   */
    getByMapper(mapper: number): Rom[] {
        return this.qb
            .where('mapper', '=', mapper)
            .order('mapper', 'ASC')
            .all<Rom>()
    }
}
