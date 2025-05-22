import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const createContext = (req: any, pubsub: any) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')

  let userId = null
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