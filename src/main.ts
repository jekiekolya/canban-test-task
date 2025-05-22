import { ApolloServer } from 'apollo-server'
import { readFileSync } from 'fs'
import { resolvers } from './interfaces/resolvers'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { createContext } from './infrastructure/context'
import { PubSub } from 'graphql-subscriptions'
import dotenv from 'dotenv'

dotenv.config()

const typeDefs = readFileSync('./src/interfaces/schema.graphql', 'utf8')

const pubsub = new PubSub()

const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({
  schema,
  context: ({ req }) => createContext(req, pubsub),
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})