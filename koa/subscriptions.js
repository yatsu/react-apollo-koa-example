import { SubscriptionManager } from 'graphql-subscriptions'
import { executableSchema, pubsub } from './executableSchema'

const subscriptionManager = new SubscriptionManager({
  schema: executableSchema,
  pubsub,
  setupFunctions: {
    todoUpdated: (options, args, subscriptionName) => {
      return {
        todoUpdated: {
          channelOptions: {},
          filter: todo => {
            // console.log('filter todo', todo)
            return true
          }
        }
      }
    }
  }
})

export default subscriptionManager
