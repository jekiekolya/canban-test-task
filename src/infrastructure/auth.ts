import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10)
}

export const comparePasswords = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash)
}

export const createJWT = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}