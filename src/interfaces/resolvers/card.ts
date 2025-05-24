export const cardResolvers = {
  Mutation: {
    createCard: async (_: any, { columnId, content, order, title }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      const card = await ctx.prisma.card.create({
        data: {
          content,
          columnId,
          order,
          title,
        },
      })
      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: card })
      return card
    },
    updateCard: async (_: any, { id, content, order, title }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      const card = await ctx.prisma.card.update({
        where: { id },
        data: { content, order, title },
      })
      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: card })
      return card
    },
    deleteCard: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.userId) throw new Error('Not authenticated')
      await ctx.prisma.card.delete({ where: { id } })
      ctx.pubsub.publish('CARD_UPDATED', { cardUpdated: { id, deleted: true } })
      return true
    },
  },
  Subscription: {
    cardUpdated: {
      subscribe: (_: any, __: any, { pubsub }: any) => pubsub.asyncIterator('CARD_UPDATED'),
    },
  },
}
