import { GraphQLContext } from '../../infrastructure/context'

export const boardResolvers = {
  Query: {
    boards: async (_: any, __: any, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      return ctx.prisma.board.findMany({
        where: { userId: ctx.userId },
        include: {
          columns: {
            include: {
              cards: true,
            },
          },
        },
      })
    },
  },

  Mutation: {
    createBoard: async (_: any, { title }: any, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      const board = await ctx.prisma.board.create({
        data: { title, userId: ctx.userId },
        include: {
          columns: {
            include: {
              cards: true,
            },
          },
        },
      })

      ctx.pubsub.publish('BOARD_UPDATED', { boardUpdated: board })
      return board
    },

    updateBoard: async (_: any, { id, title }: any, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      const existingBoard = await ctx.prisma.board.findUnique({ where: { id } })
      if (!existingBoard) {
        throw new Error(`Board with id ${id} does not exist`)
      }

      if (existingBoard.userId !== ctx.userId) {
        throw new Error(`Not authorized to update this board`)
      }

      const updatedBoard = await ctx.prisma.board.update({
        where: { id },
        data: { title },
        include: {
          columns: {
            include: {
              cards: true,
            },
          },
        },
      })

      ctx.pubsub.publish('BOARD_UPDATED', { boardUpdated: updatedBoard })
      return updatedBoard
    },

    deleteBoard: async (_: any, { id }: any, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      const existingBoard = await ctx.prisma.board.findUnique({
        where: { id },
        include: {
          columns: {
            include: {
              cards: true,
            },
          },
        },
      })

      if (!existingBoard) {
        throw new Error(`Board with id ${id} does not exist`)
      }

      if (existingBoard.userId !== ctx.userId) {
        throw new Error(`Not authorized to delete this board`)
      }

      await ctx.prisma.board.delete({ where: { id } })

      ctx.pubsub.publish('BOARD_UPDATED', {
        boardUpdated: { ...existingBoard, deleted: true },
      })

      return true
    },
  },

  Subscription: {
    boardUpdated: {
      subscribe: (_: any, __: any, ctx: GraphQLContext) => {
        return ctx.pubsub.asyncIterableIterator('BOARD_UPDATED')
      },
    },
  },
}
