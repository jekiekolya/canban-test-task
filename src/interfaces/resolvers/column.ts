export const columnResolvers = {
  Mutation: {
    createColumn: async (_: any, { boardId, title }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      const column = await ctx.prisma.column.create({
        data: {
          title,
          boardId,
        },
      })
      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: column })
      return column
    },
    updateColumn: async (_: any, { id, title }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      const column = await ctx.prisma.column.update({
        where: { id },
        data: { title },
      })
      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: column })
      return column
    },
    deleteColumn: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      await ctx.prisma.column.delete({ where: { id } })
      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: { id, deleted: true } })
      return true
    },
  },
  Subscription: {
    columnUpdated: {
      subscribe: (_: any, __: any, { pubsub }: any) => pubsub.asyncIterator('COLUMN_UPDATED'),
    },
  },
}