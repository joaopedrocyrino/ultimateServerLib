import 'dotenv/config'
import { Pool } from 'pg'

import { DatabaseError } from '../errors'

class PostgresDB {
    /*
    *  The pools variable is an object created at the construction. Each key is a name that you can choose it just have to be a string.
    *  The value, on the other side, is a Pool connection to a specific postgres db. 
    */
    private readonly pools: { [k: string]: Pool } = {}

    constructor(databaseConnectionStrings?: { [k: string]: string }) {
        /*
        *  The key default automatically fetches for a connection string on the env. If the application needs to connect to more than one
        *  db you can pass as a nullable parameter to the constructor an object where each key is the name related with the db and the value is
        *  a connection string
        */
        const connections = {
            default: process.env.DATABASE_STRING ?? '',
            ...(databaseConnectionStrings ?? {})
        }

        /*
        *  For each connection string, it creates a new Pool instance
        */
        Object.keys(connections).forEach((k) => {
            this.pools[k] = new Pool({
                connectionString: connections[k as keyof typeof connections]
            })
        })
    }

    async query<T>(queryString: string, pool?: string): Promise<T[]> {
        try {
            const poolKey = pool ?? 'default'

            const client = await this.pools[poolKey].connect()

            console.log(`\nQUERY - db ${poolKey}: ${queryString}\n`)

            const res = await client.query(queryString)

            client.release()

            return res.rows
        } catch (e) {
            console.log(`Database error: ${e}`)

            throw new DatabaseError()
        }
    }
}

export default PostgresDB
