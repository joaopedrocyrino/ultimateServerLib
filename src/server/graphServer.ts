import { ApolloServer, Config } from 'apollo-server'
import { makeExecutableSchema, IExecutableSchemaDefinition } from 'graphql-tools'
import { utils, Raw } from '../graphql'

class App {
    readonly graphql: ApolloServer | undefined

    constructor(props: {
        graphql?: IExecutableSchemaDefinition
    }) {
        if (props.graphql) {
            const schema = makeExecutableSchema(utils.mergeRawSchemas(
                Raw,
                props.graphql
            ))

            const serverConfig: Config = { schema }

            this.graphql = new ApolloServer(serverConfig)
        }
    }

    init(): void {
        this.graphql?.listen()
            .then(({ url }) => { console.log(`🚀  Server ready at ${url}`) })
            .catch(err => { console.log('❌ Failed to start server', err) })
    }
}

export default App