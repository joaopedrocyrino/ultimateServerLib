import PostgresDB from './postgresDB'

import { AppDate } from '../date'
import { DatabaseNotFoundError, DatabaseConflictError } from '../errors'

import QueryBuilder from './queryBuilder'
import {
    IPostgresGetMany,
    IPostgresUpdateMany,
    IPostgresUpdateOne,
    IPostgresCRUD,
    IPostgresColumns
} from './dto'

class PostgresCRUD {
    private readonly postgresDB: PostgresDB
    private readonly tableName: string
    private readonly primaryKeys: string[]
    private readonly selectFields: string[]
    private readonly uniqueFields: string[]

    constructor({ table: { tableName, columns }, postgresDB }: IPostgresCRUD) {
        this.postgresDB = postgresDB
        this.tableName = tableName

        const snakeCaseColumns = QueryBuilder.camelCaseToSnakeCase(columns) as IPostgresColumns

        const selectFields: string[] = []
        const primaryKeys: string[] = []
        const uniqueFields: string[] = []

        Object.keys(snakeCaseColumns).forEach(key => {
            if (snakeCaseColumns[key].select !== false) selectFields.push(key)
            if (snakeCaseColumns[key].pk) primaryKeys.push(key)
            if (snakeCaseColumns[key].unique) primaryKeys.push(key)
        })

        this.primaryKeys = primaryKeys
        this.uniqueFields = uniqueFields
        this.selectFields = selectFields
            ? [
                ...selectFields,
                'created_at',
                'updated_at',
                'is_deleted'
            ]
            : ['*']
    }

    async getOne<T>(where: Partial<T>): Promise<T> {
        let query = `SELECT ${QueryBuilder.commaBuilder(this.selectFields)} FROM ${this.tableName}`

        if (Object.keys((where)).length) {
            query += QueryBuilder.whereBuilder(where)
        }

        query += ' LIMIT 1'

        const record = await this.postgresDB.query<T>(query)

        if (!record.length) { throw new DatabaseNotFoundError() }

        return record[0] as T
    }

    async getMany<T>({
        where,
        pagination,
        sort,
        groupBy,
    }: IPostgresGetMany<T>): Promise<Array<T>> {
        let query = 'SELECT '

        if (groupBy?.length) {
            query += `${QueryBuilder.commaBuilder(groupBy)} FROM ${this.tableName} GROUP BY ${QueryBuilder.commaBuilder(groupBy as string[])}`
        } else {
            query += `${QueryBuilder.commaBuilder(this.selectFields)} FROM ${this.tableName}`
        }

        if (Object.keys(where ?? {}).length) {
            query += QueryBuilder.whereBuilder(where as { [k: string]: any })
        }

        if (sort) { query += ` ORDER BY ${sort.field} ${sort.direction.toUpperCase()}` }

        if (pagination) {
            query += ` OFFSET ${(pagination.page - 1) * pagination.perPage}`
            query += ` LIMIT ${pagination.perPage}`
        }

        const records = await this.postgresDB.query<T>(query)

        return records
    }

    async updateMany<T>({ where, data }: IPostgresUpdateMany<T>): Promise<void> {
        const updated_at = AppDate.isoDate()

        let query =
            `UPDATE ${this.tableName} ` +
            `SET ${QueryBuilder.setBuilder({ ...data, updated_at })} `

        if (where) {
            query += QueryBuilder.whereBuilder(where)
        }

        await this.postgresDB.query(query)
    }

    async updateOne<T>({ pk, data }: IPostgresUpdateOne<T>): Promise<void> {
        await this.getOne(pk)

        const updated_at = AppDate.isoDate()

        let query =
            `UPDATE ${this.tableName} ` +
            `SET ${QueryBuilder.setBuilder({ ...data, updated_at })} ` +
            QueryBuilder.whereBuilder(pk)

        await this.postgresDB.query(query)
    }

    async deleteOne(pk: { [k: string]: any }): Promise<void> {
        await this.getOne(pk)

        await this.updateOne({ pk, data: { is_deleted: true } })
    }

    async deleteMany(where?: { [k: string]: any }): Promise<void> {
        await this.updateMany({ where, data: { is_deleted: true } })
    }

    async create<T>(record: T): Promise<void> {
        const pkPrevRecord: { [k: string]: any } = {}

        this.primaryKeys.forEach(pk => { pkPrevRecord[pk] = record[pk as keyof T] })

        const prevRecord = await this.postgresDB.query<T>(
            `SELECT * FROM ${this.tableName} ` +
            QueryBuilder.whereBuilder(
                [
                    ...this.uniqueFields.map(f => ({ [f]: record[f as keyof T] })),
                    pkPrevRecord
                ]
            )
        )

        if (prevRecord.length) { throw new DatabaseConflictError() }

        const keys = Object.keys(record as object)

        let query =
            `INSERT INTO ${this.tableName} ` +
            `(${QueryBuilder.commaBuilder(keys)}) VALUES (`

        type t = keyof typeof record

        keys.forEach(k => {
            const value = QueryBuilder.formatValue(record[k as t] as string | number | boolean)

            query += `${value}, `
        })

        query = query.slice(0, -2)

        query += ')'

        await this.postgresDB.query(query)
    }
}

export default PostgresCRUD
