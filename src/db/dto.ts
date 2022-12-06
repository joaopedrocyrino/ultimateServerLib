import PostgresDB from './postgresDB'

export type ITableRelation = 'many2many' | 'many2one' | 'one2many' | 'one2one'

export type ITableField = string | {
    pk?: boolean
    unique?: boolean
    name: string
    // nullable?: boolean
    cantSelect?: boolean
    cantUpdate?: boolean
    type?: 'text' | 'number' | 'bool' | 'id'
}

export type ITable = Array<ITableField>

export interface IPostgresCRUD {
    postgresDB: PostgresDB
    pool?: string
    tableName: string
    relations?: Array<{
        type: ITableRelation,
        tableName: string,
        pk?: string,
        fk?: string
        fields: ITable
    }>
    fields: ITable
}

export interface IPostgresCRUDGetOne {
    where?: { [k: string]: any }
    
}