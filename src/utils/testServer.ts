// src/utils/testServer.ts
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { resolvers } from '../interfaces/resolvers'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import { createContext } from '../infrastructure/context'

export const createTestServer = () => {
  const typeDefs = readFileSync(join(__dirname, '../interfaces/schema.graphql'), 'utf8')
  const prisma = new PrismaClient()
  const pubsub = new PubSub()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const startServer = async () => {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => createContext(req, pubsub),
      listen: { port: 0 },
    })
    return { server, url, prisma }
  }

  return { server, prisma, startServer }
}
