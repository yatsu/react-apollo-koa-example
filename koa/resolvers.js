// @flow
import createDebug from 'debug'
import jwt from 'jsonwebtoken'
import { PubSub } from 'graphql-subscriptions'
import R from 'ramda'
import env from './env'
import { todos } from './store'

const debugGraphQL = createDebug('example:graphql')

const pubsub = new PubSub()

const authenticated = (method: Function) =>
  async (_, args: Object, context: Object) => {
    const { ctx } = context
    try {
      const { user } = jwt.verify(
        ctx.request.header.authorization ? ctx.request.header.authorization.split(' ')[1] : '',
        env('AUTH_SECRET')
      )
      ctx.state.user = user
    } catch (error) {
      ctx.throw(401, 'Access denied.')
    }
    const result = await method(_, args, context)
    return result
  }

function authenticatedResolvers(resolvers: Object): Object {
  return R.mapObjIndexed(
    (resolver: Object, key: string) => {
      if (key === 'Subscription') {
        // NOTE: authentication is currently not available for subscription
        return resolver
      }
      debugGraphQL('key', key, resolver)
      return R.mapObjIndexed((method: Function) => authenticated(method), resolver)
    },
    resolvers
  )
}

const resolvers = authenticatedResolvers({
  TodoList: {
    todos() {
      return todos
    }
  },
  Query: {
    todoList() {
      return true
    }
  },
  Mutation: {
    addTodo(_, { text }) {
      const todo = {
        id: (todos.length + 1).toString(),
        text,
        completed: false
      }
      todos.push(todo)
      pubsub.publish('todoUpdated', todo)
      return todo
    },
    toggleTodo(_, { id }, { ctx }) {
      const todo = todos[id - 1]
      if (!todo) {
        ctx.throw(404, `Couldn't find Todo with id ${id}`)
      }
      todo.completed = !todo.completed
      pubsub.publish('todoUpdated', todo)
      return todo
    }
  },
  Subscription: {
    todoUpdated(todo: Object) {
      debugGraphQL('todoUpdated', todo)
      return todo
    }
  }
})

export { resolvers, pubsub }
