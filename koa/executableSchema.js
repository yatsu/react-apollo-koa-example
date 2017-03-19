// @flow
import { makeExecutableSchema } from 'graphql-tools'
import schema from './schema'
import { resolvers, pubsub } from './resolvers'

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers
})

export { executableSchema, pubsub }
