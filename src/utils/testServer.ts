import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { resolvers } from '../interfaces/resolvers'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { createContext } from '../core/context'
import { PubSub } from 'graphql-subscriptions'

export const createTestServer = () => {
  const typeDefs = readFileSync(join(__dirname, '../../schema.graphql'), 'utf8')
  const prisma = new PrismaClient()
  const pubsub = new PubSub()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const startServer = async () => {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => createContext(req.headers.authorization || '', prisma, pubsub),
      listen: { port: 0 },
    })
    return { server, url, prisma }
  }

  return { server, prisma, startServer }
}
