// @flow
import R from 'ramda'
import { Todo } from '../types'

// Actions

const CREATE = 'todo/CREATE'
const TOGGLE = 'todo/TOGGLE'

// Types

export type TodoAction = {
  type: string,
  payload?: {
    todo?: Todo,
    todoID?: string
  }
}

export type TodoState = {
  'todos': { [id: string]: Todo }
}

export const todosPath = ['todos']
export const todoIDPath = ['todoID']
export const todoTextPath = ['todo', 'text']

// Reducer

export const initialState: TodoState = {
  todos: {
    '0': { id: '0', text: 'hello', completed: true }, // eslint-disable-line quote-props
    '1': { id: '1', text: 'world', completed: false } // eslint-disable-line quote-props
  }
}

export default function todoReducer(state: TodoState = initialState, action: Object = {}) {
  switch (action.type) {
    case CREATE:
      return R.over(
        R.lensPath(todosPath),
        (todos: { [id: string]: Todo }) =>
          R.assoc(
            R.keys(todos).length.toString(),
            {
              id: R.keys(todos).length.toString(),
              text: R.path(todoTextPath, action.payload),
              completed: false
            },
            todos
          ),
        state
      )
    case TOGGLE:
      return R.over(
        R.lensPath([...todosPath, R.path(todoIDPath, action.payload)]),
        (todo: Todo) => R.assoc('completed', !todo.completed, todo),
        state
      )
    default:
      return state
  }
}

// Action Creators

export function createTodo(text: Object) {
  return { type: CREATE, payload: { todo: { text } } }
}

export function toggleTodo(todoID: string) {
  return { type: TOGGLE, payload: { todoID } }
}
