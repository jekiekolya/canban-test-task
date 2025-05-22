export const boardResolvers = {
  Query: {
    boards: async (_: any, __: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      return ctx.prisma.board.findMany({
        where: { userId: ctx.userId },
        include: { columns: { include: { cards: true } } },
      })
    },
  },
  Mutation: {
    createBoard: async (_: any, { title }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      const board = await ctx.prisma.board.create({
        data: { title, userId: ctx.userId },
      })
      ctx.pubsub.publish('BOARD_UPDATED', { boardUpdated: board })
      return board
    },
    deleteBoard: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      await ctx.prisma.board.delete({ where: { id } })
      ctx.pubsub.publish('BOARD_UPDATED', { boardUpdated: { id, deleted: true } })
      return true
    },
  },
  Subscription: {
    boardUpdated: {
      subscribe: (_: any, __: any, { pubsub }: any) => pubsub.asyncIterator('BOARD_UPDATED'),
    },
  },
}