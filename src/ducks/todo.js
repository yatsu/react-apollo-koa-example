// @flow
import R from 'ramda'
import { createAction, createReducer } from 'redux-act'
import { Todo } from '../types'
import { keyLength } from '../utils'

// Types

export type TodoAction = {
  type: string,
  payload?: {
    todo?: Todo,
    todoID?: string
  }
}

export type TodoState = {
  'todos': { [string]: Todo }
}

// Action Creators

export const createTodo = createAction('TODO_CREATE')
export const toggleTodo = createAction('TODO_TOGGLE')

// Reducer

export const initialState: TodoState = {
  todos: {
    '0': { id: '0', text: 'hello', completed: true }, // eslint-disable-line quote-props
    '1': { id: '1', text: 'world', completed: false } // eslint-disable-line quote-props
  }
}

export const todoReducer = createReducer(
  {
    [createTodo]: (state: TodoState, text: string) => {
      const id = keyLength(state.todos).toString()
      return {
        todos: R.assoc(
          id,
          {
            id,
            text,
            completed: false
          },
          state.todos
        )
      }
    },

    [toggleTodo]: (state: TodoState, todoID: string) => {
      const todo = state.todos[todoID]
      todo.completed = !todo.completed
      return {
        todos: R.assoc(todo.id, todo, state.todos)
      }
    }
  },
  initialState
)
