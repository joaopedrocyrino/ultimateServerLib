import PostgresDB from './postgresDB'

interface IPostgresPagination {
    page: number
    perPage: number
}

interface IPostgresSort {
    direction: 'asc' | 'desc' | 'DESC' | 'ASC'
    field: string
}

export interface IPostgresGetMany<T>  {
    where?: Partial<T> | Array<Partial<T>>
    pagination?: IPostgresPagination,
    sort?: IPostgresSort
    groupBy?: string[]
}

export interface IPostgresUpdateMany<T>  {
    where?: Partial<T> | Array<Partial<T>>
    data: Partial<T>
}

export interface IPostgresUpdateOne<T>  {
    pk: { [k: string]: any }
    data: Partial<T>
}

export interface IPostgresColumn {
    pk?: boolean
    unique?: boolean
    select?: boolean
}

export type IPostgresColumns = {
    [k: string]: IPostgresColumn
}

export interface IPostgresTable {
    tableName: string
    columns: IPostgresColumns
}

export interface IPostgresCRUD {
    table: IPostgresTable
    postgresDB: PostgresDB
}
