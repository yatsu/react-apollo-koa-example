import { SubscriptionManager } from 'graphql-subscriptions'
import { executableSchema, pubsub } from './executableSchema'

const subscriptionManager = new SubscriptionManager({
  schema: executableSchema,
  pubsub,
  setupFunctions: {
    todoUpdated: (options, args, subscriptionName) => ({
      todoUpdated: {
        channelOptions: {},
        filter: todo =>
            // console.log('filter todo', todo)
             true
      }
    })
  }
})

export default subscriptionManager
