// @flow
import { SubscriptionManager } from 'graphql-subscriptions'
import { executableSchema, pubsub } from './executableSchema'

const subscriptionManager = new SubscriptionManager({
  schema: executableSchema,
  pubsub,
  setupFunctions: {
    todoUpdated: () => ({
      todoUpdated: {
        channelOptions: {},
        filter: () => true
      }
    })
  }
})

export default subscriptionManager
