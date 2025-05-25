import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { createServer } from 'http'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { readFileSync } from 'fs'
import { PubSub } from 'graphql-subscriptions'
import { resolvers } from './interfaces/resolvers'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { createContext } from './infrastructure/context'
import dotenv from 'dotenv'

dotenv.config()

const startServer = async () => {
  const typeDefs = readFileSync('./src/interfaces/schema.graphql', 'utf8')
  const pubsub = new PubSub()
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const app = express()
  const httpServer = createServer(app)

  const server = new ApolloServer({
    schema,
    context: ({ req }) => createContext(req, pubsub),
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            },
          }
        },
      },
    ],
  })

  await server.start()

  server.applyMiddleware({ app })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => createContext({} as any, pubsub),
      onDisconnect: () => console.log('🔌 Client disconnected'),
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  )

  const PORT = process.env.PORT || 4000
  httpServer.listen(PORT, () => {
    console.log(`HTTP: http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`WS:   ws://localhost:${PORT}${server.graphqlPath}`)
  })
}

startServer().catch((err) => {
  console.error('Server failed to start:', err)
})
