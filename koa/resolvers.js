// @flow
import createDebug from 'debug'
import { PubSub } from 'graphql-subscriptions'
import { todos } from './store'

const debug = createDebug('example:graphql')

const pubsub = new PubSub()

const resolvers = {
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
    async addTodo(_: Object, { text }: Object, { ctx }: Object) {
      if (!ctx.state.user) {
        // TODO: Do this globally
        ctx.throw(401, 'Access denied.')
      }
      const todo = {
        id: (todos.length + 1).toString(),
        text,
        completed: false
      }
      todos.push(todo)
      pubsub.publish('todoUpdated', todo)
      return todo
    },
    toggleTodo(_: Object, { id }: Object, { ctx }: Object) {
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
      debug('todoUpdated', todo)
      return todo
    }
  }
}

export { resolvers, pubsub }
