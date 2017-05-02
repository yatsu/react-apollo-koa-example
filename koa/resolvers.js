// @flow
import createDebug from 'debug'
import { PubSub } from 'graphql-subscriptions'
import { todos } from './store'

const debug = createDebug('server:resolvers')

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
    addTodo(_: Object, { text }: Object) {
      const todo = {
        id: (todos.length + 1).toString(),
        text,
        completed: false
      }
      todos.push(todo)
      pubsub.publish('todoUpdated', todo)
      return todo
    },
    toggleTodo(_: Object, { id }: Object) {
      const todo = todos[id - 1]
      if (!todo) {
        throw new Error(`Couldn't find Todo with id ${id}`)
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
