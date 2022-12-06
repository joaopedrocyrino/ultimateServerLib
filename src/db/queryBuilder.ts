class QueryBuilder {
    static whereBuilder(where: { [k: string]: any } | Array<{ [k: string]: any }>): string {
        let query = ''

        if (Array.isArray(where)) {
            where.forEach(w => { query += `(${this.whereBuilder(w)}) OR ` })

            query = query.slice(0, -4)
        } else {
            Object.keys(where).forEach((k: string) => {
                let value: string = ''

                if (typeof where[k] === 'boolean') {
                    value = where[k] ? 'true' : 'false'
                } else if (where[k]) {
                    if (typeof where[k] === 'number') {
                        value = `${where[k]}`
                    } else { value = `'${where[k]}'` }
                }

                if (value) { query += `${k} = ${value} AND ` }
            })

            if (query) { query = query.slice(0, -5) }
        }

        return query
    }

    static commaBuilder(fields: string[]): string {
        let query = ''

        fields.forEach(f => { query += `${f}, ` })

        if (query.length) { query = query.slice(0, -2) }

        return query
    }

    static setBuilder(fields: { [k: string]: string | number | boolean }): string {
        let query = ''

        Object.keys(fields).forEach((k: string) => {
            let value = ''

            if (typeof fields[k] === 'boolean') {
                value = fields[k] ? 'true' : 'false'
            } else if (fields[k]) {
                if (typeof fields[k] === 'number') {
                    value = `${fields[k]}`
                } else { value = `'${fields[k]}'` }
            }

            if (value) { query += `${k} = ${value}, ` }
        })

        if (query) { query = query.slice(0, -2) }

        return query
    }

}

export default QueryBuilder
