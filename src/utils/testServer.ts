import { ApolloServer } from '@apollo/server'
import { resolvers } from '../interfaces/resolvers'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import jwt from 'jsonwebtoken'

export const createTestServer = () => {
  const typeDefs = readFileSync(join(__dirname, '../interfaces/schema.graphql'), 'utf8')
  const prisma = new PrismaClient()
  const pubsub = new PubSub()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const createTestContext = () => ({
    prisma,
    userId: null,
    pubsub,
  })

  const createAuthenticatedContext = (token: string) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      return {
        prisma,
        userId: decoded.userId,
        pubsub,
      }
    } catch {
      return createTestContext()
    }
  }

  return { server, prisma, createTestContext, createAuthenticatedContext }
}
