import { hashPassword, comparePasswords, createJWT } from '../../infrastructure/auth'

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } })
    },
  },
  Mutation: {
    register: async (_: any, args: any, ctx: any) => {
      const hashed = await hashPassword(args.password)
      const user = await ctx.prisma.user.create({
        data: { email: args.email, password: hashed },
      })

      return createJWT(user.id)
    },
    login: async (_: any, args: any, ctx: any) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: args.email } })
      if (!user) throw new Error('User not found')
      const valid = await comparePasswords(args.password, user.password)
      if (!valid) throw new Error('Invalid password')
      return createJWT(user.id)
    },
  },
}
