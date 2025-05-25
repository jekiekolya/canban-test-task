import { GraphQLContext } from '../../infrastructure/context'

export const cardResolvers = {
  Mutation: {
    createCard: async (
      _: any,
      {
        columnId,
        description,
        order,
        title,
      }: { columnId: string; description: string; order: number; title: string },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if column exists
      const column = await ctx.prisma.column.findUnique({ where: { id: columnId } })
      if (!column) {
        throw new Error(`Column with id ${columnId} does not exist`)
      }

      const card = await ctx.prisma.card.create({
        data: {
          description,
          columnId,
          order,
          title,
        },
      })

      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: card })
      return card
    },

    updateCard: async (
      _: any,
      {
        id,
        description,
        order,
        title,
      }: { id: string; description?: string; order?: number; title?: string },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if card exists
      const existingCard = await ctx.prisma.card.findUnique({ where: { id } })
      if (!existingCard) {
        throw new Error(`Card with id ${id} does not exist`)
      }

      const card = await ctx.prisma.card.update({
        where: { id },
        data: { description, order, title },
      })

      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: card })
      return card
    },

    deleteCard: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new Error('Not authenticated')

      // Check if card exists
      const existingCard = await ctx.prisma.card.findUnique({ where: { id } })
      if (!existingCard) {
        throw new Error(`Card with id ${id} does not exist`)
      }

      await ctx.prisma.card.delete({ where: { id } })
      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: { id, deleted: true } })
      return true
    },
  },

  Subscription: {
    cardUpdated: {
      subscribe: (_: any, __: any, { pubsub }: GraphQLContext) =>
        pubsub.asyncIterableIterator('CARD_UPDATED'),
    },
  },
}
