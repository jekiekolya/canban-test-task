import { userResolvers } from './user'
import { boardResolvers } from './board'
import { columnResolvers } from './column'
import { cardResolvers } from './card'

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...boardResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...boardResolvers.Mutation,
    ...columnResolvers.Mutation,
    ...cardResolvers.Mutation,
  },
  Subscription: {
    ...boardResolvers.Subscription,
    ...columnResolvers.Subscription,
    ...cardResolvers.Subscription,
  },
}