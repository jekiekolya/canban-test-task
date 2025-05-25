import { GraphQLContext } from '../../infrastructure/context'

export const columnResolvers = {
  Mutation: {
    createColumn: async (
      _: any,
      { boardId, title, order }: { boardId: string; title: string; order: number },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if board exists and belongs to the user
      const board = await ctx.prisma.board.findUnique({ where: { id: boardId } })
      if (!board) throw new Error(`Board with id ${boardId} does not exist`)
      if (board.userId !== ctx.userId) throw new Error('Not authorized to add column to this board')

      const column = await ctx.prisma.column.create({
        data: {
          title,
          boardId,
          order,
        },
        include: {
          cards: true,
        },
      })

      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: column })
      return column
    },

    updateColumn: async (
      _: any,
      { id, title, order }: { id: string; title?: string; order?: number },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if column exists
      const column = await ctx.prisma.column.findUnique({ where: { id }, include: { board: true } })
      if (!column) throw new Error(`Column with id ${id} does not exist`)
      if (column.board.userId !== ctx.userId)
        throw new Error('Not authorized to update this column')

      const updatedColumn = await ctx.prisma.column.update({
        where: { id },
        data: { title, order },
        include: {
          cards: true,
        },
      })

      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: updatedColumn })
      return updatedColumn
    },

    deleteColumn: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if column exists
      const column = await ctx.prisma.column.findUnique({ where: { id }, include: { board: true } })
      if (!column) throw new Error(`Column with id ${id} does not exist`)
      if (column.board.userId !== ctx.userId)
        throw new Error('Not authorized to delete this column')

      await ctx.prisma.column.delete({ where: { id } })

      ctx.pubsub.publish('COLUMN_UPDATED', { columnUpdated: { id, deleted: true } })
      return true
    },
  },

  Subscription: {
    columnUpdated: {
      subscribe: (_: any, __: any, { pubsub }: GraphQLContext) =>
        pubsub.asyncIterableIterator('COLUMN_UPDATED'),
    },
  },
}
