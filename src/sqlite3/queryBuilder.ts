import type { Database } from 'node-sqlite3-wasm'

/**
 * SQL查询构建器 - 用于简化数据库操作，避免手写SQL
 */
export class QueryBuilder {
    private db: Database
    private tableName: string
    private conditions: string[] = []
    private params: any[] = []
    private fields: string = '*'
    private limit: number | null = null
    private offset: number = 0
    private orderBy: string = ''

    constructor(db: Database, tableName: string) {
        this.db = db
        this.tableName = tableName
    }

    /**
   * 指定要查询的字段
   */
    select(fields: string[] | string): QueryBuilder {
        if (Array.isArray(fields)) {
            this.fields = fields.join(', ')
        }
        else {
            this.fields = fields
        }

        return this
    }

    /**
   * 添加WHERE条件
   */
    where(field: string, operator: string, value: any): QueryBuilder {
        this.conditions.push(`${field} ${operator} ?`)
        this.params.push(value)

        return this
    }

    /**
   * 添加LIKE条件
   */
    whereLike(field: string, value: string): QueryBuilder {
        this.conditions.push(`${field} LIKE ?`)
        this.params.push(`%${value}%`)

        return this
    }

    /**
   * 添加IN条件
   */
    whereIn(field: string, values: any[]): QueryBuilder {
        const placeholders = values.map(() => '?').join(', ')
        this.conditions.push(`${field} IN (${placeholders})`)
        this.params.push(...values)

        return this
    }

    /**
   * 添加排序
   */
    order(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
        this.orderBy = `ORDER BY ${field} ${direction}`

        return this
    }

    /**
   * 添加分页限制
   */
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

        return this.db.all(sql, ...this.params) as T[]
    }

    get<T = any>(): T | null {
        const sql = this.buildSelectSQL()
        const result = this.db.get(sql, ...this.params) as T | undefined

        return result || null
    }

    join(queryBuilder: QueryBuilder, localKey: string, foreignKey: string, alias: string): QueryBuilder {
        this.tableName = `${this.tableName} JOIN ${queryBuilder.tableName} AS ${alias} ON ${this.tableName}.${localKey} = ${alias}.${foreignKey}`
        this.params.push(...queryBuilder.params)
        if (queryBuilder.conditions.length > 0) {
            this.conditions.push(...queryBuilder.conditions)
        }

        return this
    }

    /**
   * 构建SELECT SQL语句
   */
    private buildSelectSQL(): string {
        let sql = `SELECT ${this.fields} FROM ${this.tableName}`
    
        if (this.conditions.length > 0) {
            sql += ` WHERE ${this.conditions.join(' AND ')}`
        }
    
        if (this.orderBy) {
            sql += ` ${this.orderBy}`
        }
    
        if (this.limit !== null) {
            sql += ` LIMIT ${this.limit} OFFSET ${this.offset}`
        }
    
        return sql
    }
}

