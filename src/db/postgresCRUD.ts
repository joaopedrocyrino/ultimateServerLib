import { AppDate } from '../date'
import { IPostgresCRUD } from './dto'
import PostgresDB from './postgresDB'
import QueryBuilder from './queryBuilder'

class PostgresCRUD {
    private readonly tableName?: string
    private readonly postgresDB?: PostgresDB


    // private readonly selectFields: string[]
    // private readonly uniqueFields: Array<string | string[]>

    constructor({ fields, ...props }: IPostgresCRUD) {
        const createFields = []
        const readFields = []
        const updateFields = []
        const uniqueFields = []

        fields.forEach(field => {
            if (typeof field === 'string') {
                createFields.push(field)
                readFields.push(field)
                updateFields.push(field)
            } else {
                createFields.push(field.name)
                
                if (!field.cantSelect) readFields.push(field.name)

                if (!field.cantUpdate) updateFields.push(field.name)

            }
        })

        Object.assign(this, props)



        // this.selectFields = selectFields
        //     ? [
        //         ...selectFields,
        //         'id',
        //         'created_at',
        //         'updated_at',
        //         'is_deleted'
        //     ]
        //     : ['*']
        // this.uniqueFields = uniqueFields ?? ['id']
    }

    async getOne<T>(fields: Partial<T | baseFields>): Promise<T> {
        let query = `SELECT ${QueryBuilder.commaBuilder(this.selectFields)} FROM ${this.tableName ?? ''}`

        if (Object.keys(fields).length) {
            query += ` WHERE ${QueryBuilder.whereBuilder(fields)}`
        }

        query += ' LIMIT 1'

        const record = await this.postgresDB?.query<T>(query)

        if (!record.length) { throw new BaseError(404, 'GET ONE ERROR: Not found') }

        return record[0] as T
    }

    async getMany<T>({
        fields,
        take,
        skip,
        order,
        direction,
        group
    }: getMany<T>): Promise<Array<T>> {
        let query = 'SELECT '

        if (group?.length) {
            query += `${QueryBuilder.commaBuilder(group as string[])} FROM ${this.entity} GROUP BY ${QueryBuilder.commaBuilder(group as string[])}`
        } else {
            query += `${QueryBuilder.commaBuilder(this.selectFields)} FROM ${this.entity}`
        }

        if (fields?.length) { query += ` WHERE ${QueryBuilder.whereBuilder(fields)}` }
        if (order && direction) { query += ` ORDER BY ${order as string} ${direction}` }
        if (skip) { query += ` OFFSET ${skip}` }
        if (take) { query += ` LIMIT ${take}` }

        const records = await this.database.query<T>(query)

        return records
    }

    async update<T>(id: string, fields: Partial<T>): Promise<void> {
        await this.getOne({ id })

        const updated_at = AppDate.isoDate()

        const query =
            `UPDATE ${this.entity} ` +
            `SET ${QueryBuilder.setBuilder({ ...fields, updated_at })} ` +
            `WHERE id = '${id}'`

        await this.database.query(query)
    }

    async delete(id: string): Promise<void> {
        await this.getOne({ id })

        await this.update(id, { is_deleted: true })
    }

    async create<T>(record: T): Promise<void> {
        const prevRecord = await this.database.query<T>(
            `SELECT * FROM ${this.entity} ` +
            `WHERE ${QueryBuilder.whereBuilder(
                this.uniqueFields.map(f => {
                    if (typeof f === 'string') {
                        return { [f]: record[f as keyof T] }
                    }

                    const where: { [k: string]: any } = {}

                    f.forEach(k => { where[k] = record[k as keyof T] })

                    return where
                })
            )}`
        )

        if (prevRecord.length) { throw new BaseError(409, 'CREATE ERROR: Conflict') }

        const keys = Object.keys(record)

        let query =
            `INSERT INTO ${this.entity} ` +
            `(${QueryBuilder.commaBuilder(keys)}) VALUES (`

        type t = keyof typeof record

        keys.forEach(k => {

            let value = ''

            if (typeof record[k as t] === 'boolean') {
                value = record[k as t] ? 'true' : 'false'
            } else if (record[k as t]) {
                if (typeof record[k as t] === 'number') {
                    value = `${record[k as t]}`
                } else { value = `'${record[k as t]}'` }
            }

            query += `${value}, `
        })

        query = query.slice(0, -2)

        query += ')'

        await this.database.query(query)
    }
}

export default PostgresCRUD
