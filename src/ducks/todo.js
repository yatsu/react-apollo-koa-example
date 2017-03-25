// @flow
import { Map as iMap, fromJS } from 'immutable'
import { Todo } from '../types/todo'

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
            text: action.payload.todo,
            completed: false
          })
        )
      )
    case TOGGLE:
      return (() => {
        const todo = todos.get(action.payload.todoID)
        return state.set(
          'todos',
          todos.set(action.payload.todoID, todo.set('completed', !todo.get('completed')))
        )
      })()
    default:
      return state
  }
}

// Action Creators

export type TodoAction = {
  type: string,
  payload?: {
    todo?: Todo,
    todoID?: string
  }
};

export function createTodo(todo: Object) {
  return { type: CREATE, payload: { todo } }
}

export function toggleTodo(todoID: string) {
  return { type: TOGGLE, payload: { todoID } }
}
