class QueryBuilder {
    static whereBuilder(where: { [k: string]: any } | Array<{ [k: string]: any }>): string {
        let query = ''

        if (Array.isArray(where)) {
            where.forEach(w => { query += `(${this.whereBuilder(w).slice(6)}) OR ` })

            query = query.slice(0, -4)
        } else {
            Object.keys(where).forEach((k) => {
                const value: string = this.formatValue(where[k])

                if (value) { query += `${this.camelCaseToSnakeCase(k)} = ${value} AND ` }
            })

            if (query) { query = query.slice(0, -5) }
        }

        return `WHERE ${query}`
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
            const value = this.formatValue(fields[k])

            if (value) { query += `${k} = ${value}, ` }
        })

        if (query) { query = query.slice(0, -2) }

        return query
    }

    static camelCaseToSnakeCase(value: string | { [k: string]: any }) {
        if (typeof value === 'string') return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

        const formattedObj: { [k: string]: any } = {}

        Object.keys(value).forEach(key => {
            formattedObj[this.camelCaseToSnakeCase(key) as string] = value[key]
        })

        return formattedObj
    }

    static formatValue(value: string | number | boolean) {
        let formatValue = ''

        if (typeof value === 'boolean') {
            formatValue = value ? 'true' : 'false'
        } else if (value) {
            if (typeof value === 'number') {
                formatValue = `${value}`
            } else { formatValue = `'${value}'` }
        }

        return formatValue
    }

}

export default QueryBuilder
