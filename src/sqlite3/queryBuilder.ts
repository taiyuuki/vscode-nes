import type { Database } from 'node-sqlite3-wasm'

/**
 * SQL查询构建器 - 用于简化数据库操作，避免手写SQL
 */
export class QueryBuilder {
    private db: Database
    private tableName: string

    private conditions: { conj: 'AND' | 'OR'; sql: string }[] = []
    private params: any[] = []
    private fields: string = '*'
    private limit: number | null = null
    private offset: number = 0
    private orderBy: string = ''

    constructor(db: Database, tableName: string) {
        this.db = db
        this.tableName = tableName
    }

    select(fields: string[] | string): QueryBuilder {
        if (Array.isArray(fields)) {
            this.fields = fields.join(', ')
        }
        else {
            this.fields = fields
        }

        return this
    }

    where(field: string, operator: string, value: any): QueryBuilder {
        this.addCondition('AND', `${field} ${operator} ?`, value)

        return this
    }

    orWhere(field: string, operator: string, value: any): QueryBuilder {
        this.addCondition('OR', `${field} ${operator} ?`, value)

        return this
    }

    whereLike(field: string, value: string): QueryBuilder {
        this.addCondition('AND', `${field} LIKE ?`, `%${value}%`)

        return this
    }

    orWhereLike(field: string, value: string): QueryBuilder {
        this.addCondition('OR', `${field} LIKE ?`, `%${value}%`)

        return this
    }

    whereIn(field: string, values: any[]): QueryBuilder {
        const placeholders = values.map(() => '?').join(', ')
        this.addCondition('AND', `${field} IN (${placeholders})`, ...values)

        return this
    }

    orWhereIn(field: string, values: any[]): QueryBuilder {
        const placeholders = values.map(() => '?').join(', ')
        this.addCondition('OR', `${field} IN (${placeholders})`, ...values)

        return this
    }

    whereRaw(sql: string, params: any[] = []): QueryBuilder {
        this.addCondition('AND', sql, ...params)

        return this
    }

    orWhereRaw(sql: string, params: any[] = []): QueryBuilder {
        this.addCondition('OR', sql, ...params)

        return this
    }

    order(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
        this.orderBy = `ORDER BY ${field} ${direction}`

        return this
    }

    reset(): QueryBuilder {
        this.conditions = []
        this.params = []
        this.fields = '*'
        this.limit = null
        this.offset = 0
        this.orderBy = ''

        return this
    }

    setLimit(limit: number, offset: number = 0): QueryBuilder {
        this.limit = limit
        this.offset = offset

        return this
    }

    /**
   * 执行查询并返回所有结果
   */
    all<T = any>(): T[] {
        const sql = this.buildSelectSQL()

        return this.db.all(sql, this.params) as T[]
    }

    get<T = any>(): T | null {
        const sql = this.buildSelectSQL()
        const result = this.db.get(sql, this.params) as T | undefined

        return result || null
    }

    join(queryBuilder: QueryBuilder, localKey: string, foreignKey: string, alias: string): QueryBuilder {
        this.tableName = `${this.tableName} JOIN ${queryBuilder.tableName} AS ${alias} ON ${this.tableName}.${localKey} = ${alias}.${foreignKey}`
        this.params.push(...queryBuilder.params)
        if (queryBuilder.conditions.length > 0) {

            queryBuilder.conditions.forEach(c => this.addCondition(c.conj, c.sql))
        }

        return this
    }

    /**
   * 构建SELECT SQL语句
   */
    private buildSelectSQL(): string {
        let sql = `SELECT ${this.fields} FROM ${this.tableName}`

        if (this.conditions.length > 0) {

            // 首条条件不加连接词
            const condSql = this.conditions
                .map((c, idx) => idx === 0 ? c.sql : `${c.conj} ${c.sql}`)
                .join(' ')
            sql += ` WHERE ${condSql}`
        }

        if (this.orderBy) {
            sql += ` ${this.orderBy}`
        }

        if (this.limit !== null) {
            sql += ` LIMIT ${this.limit} OFFSET ${this.offset}`
        }

        return sql
    }

    private addCondition(conj: 'AND' | 'OR', sql: string, ...params: any[]) {
        this.conditions.push({ conj, sql })
        if (params.length) this.params.push(...params)
    }

    /** 统计行数 */
    count(): number {
        let sql = `SELECT COUNT(*) as _cnt FROM ${this.tableName}`
        if (this.conditions.length > 0) {
            const condSql = this.conditions
                .map((c, idx) => idx === 0 ? c.sql : `${c.conj} ${c.sql}`)
                .join(' ')
            sql += ` WHERE ${condSql}`
        }
        const row = this.db.get(sql, this.params) as { _cnt: number } | undefined

        return row?._cnt ?? 0
    }
}

