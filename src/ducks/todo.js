// @flow
import { Map as iMap, fromJS } from 'immutable'

// Actions

const CREATE = 'todo/CREATE'
const TOGGLE = 'todo/TOGGLE'

// Reducer

export default function todoReducer(state: iMap<string, any> = iMap(), action: Object = {}) {
  const todos = state.get('todos')
  switch (action.type) {
    case CREATE:
      return state.set(
        'todos',
        todos.push(
          fromJS({
            id: todos.size.toString(),
            text: action.todo,
            completed: false
          })
        )
      )
    case TOGGLE:
      return (() => {
        const todo = todos.get(action.todoID)
        return state.set(
          'todos',
          todos.set(action.todoID, todo.set('completed', !todo.get('completed')))
        )
      })()
    default:
      return state
  }
}

// Action Creators

export function createTodo(todo: Object) {
  return { type: CREATE, todo }
}

export function toggleTodo(todoID: string) {
  return { type: TOGGLE, todoID }
}
