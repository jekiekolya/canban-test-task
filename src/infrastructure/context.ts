// src/infrastructure/context.ts
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { IncomingMessage } from 'http'
import { PubSub } from 'graphql-subscriptions'

const prisma = new PrismaClient()

export interface GraphQLContext {
  prisma: PrismaClient
  userId: string | null
  pubsub: PubSub
}

export const createContext = (req: IncomingMessage, pubsub: PubSub): GraphQLContext => {
  const authHeader = req?.headers?.authorization || ''
  const token = authHeader.replace('Bearer ', '')

  let userId: string | null = null
  try {
    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      userId = decoded.userId
    }
  } catch (e) {
    console.warn('Invalid token')
  }

  return { prisma, userId, pubsub }
}
