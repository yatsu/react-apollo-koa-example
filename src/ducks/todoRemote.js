// @flow
import R from 'ramda'
import { createLogic } from 'redux-logic'
import TODO_LIST_QUERY from '../graphql/todoListQuery.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'
import type { Action, Todo } from '../types'

// Actions

const FETCH = 'todo-remote/FETCH'
const FETCH_SUCCEEDED = 'todo-remote/FETCH_SUCCEEDED'
const FETCH_FAILED = 'todo-remote/FETCH_FAILED'
const CREATE = 'todo-remote/CREATE'
const CREATE_SUCCEEDED = 'todo-remote/CREATE_SUCCEEDED'
const CREATE_FAILED = 'todo-remote/CREATE_FAILED'
const TOGGLE = 'todo-remote/TOGGLE'
const TOGGLE_SUCCEEDED = 'todo-remote/TOGGLE_SUCCEEDED'
const TOGGLE_FAILED = 'todo-remote/TOGGLE_FAILED'

// Types

type TodoRemoteState = {
  todos: { [id: string]: Todo },
  fetching: boolean,
  fetchError: ?string,
  createError: ?string,
  toggleError: ?string
}

// Reducer

const initialState: TodoRemoteState = {
  todos: {},
  fetching: false,
  fetchError: null,
  createError: null,
  toggleError: null
}

export function todoRemoteReducer(state: TodoRemoteState = initialState, action: Action = {}) {
  switch (action.type) {
    case FETCH:
      return R.assoc('fetching', true, state)
    case FETCH_SUCCEEDED:
      return R.pipe(
        R.assoc('fetching', true),
        R.assoc(
          'todos',
          R.reduce(
            (acc: { [id: string]: Todo }, t: Todo) => R.assoc(t.id, t, acc),
            {},
            R.prop('todos', action.payload)
          )
        )
      )(state)
    case FETCH_FAILED:
      return R.pipe(
        R.assoc('fetching', true),
        R.assoc('fetchError', R.path(['error', 'message'], action.payload))
      )(state)
    case CREATE:
      return state
    case CREATE_SUCCEEDED:
      return state
    case CREATE_FAILED:
      return R.assoc('createError', R.path(['error', 'message'], action.payload), state)
    case TOGGLE:
      return state
    case TOGGLE_SUCCEEDED:
      return R.assocPath(
        ['todos', R.path(['todo', 'id'], action.payload), 'completed'],
        R.path(['todo', 'completed'], action.payload),
        state
      )
    case TOGGLE_FAILED:
      return R.assoc('toggleError', R.path(['error', 'message'], action.payload), state)
    default:
      return state
  }
}

// Action Creators

export function fetchTodos(): Action {
  return {
    type: FETCH
  }
}

export function fetchTodosSucceeded(todos: Array<Todo>): Action {
  return {
    type: FETCH_SUCCEEDED,
    payload: {
      todos
    }
  }
}

export function fetchTodosFailed(error: Object): Action {
  return {
    type: FETCH_FAILED,
    payload: {
      error
    }
  }
}

export function createTodo(todo: Todo): Action {
  return {
    type: CREATE,
    payload: {
      todo
    }
  }
}

export function createTodoSucceeded(todo: Todo): Action {
  return {
    type: CREATE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function createTodoFailed(error: Object): Action {
  return {
    type: CREATE_FAILED,
    payload: {
      error
    }
  }
}

export function toggleTodo(todoID: string): Action {
  return {
    type: TOGGLE,
    payload: {
      todoID
    }
  }
}

export function toggleTodoSucceeded(todo: Todo): Action {
  return {
    type: TOGGLE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function toggleTodoFailed(error: Object): Action {
  return {
    type: TOGGLE_FAILED,
    payload: {
      error
    }
  }
}

// Logic

export const todosFetchLogic = createLogic({
  type: [FETCH, CREATE_SUCCEEDED],

  processOptions: {
    dispatchReturn: true,
    successType: fetchTodosSucceeded,
    failType: fetchTodosFailed
  },

  process({ apollo }) {
    return apollo
      .query({
        query: TODO_LIST_QUERY,
        fetchPolicy: 'network-only'
      })
      .map(resp => resp.data.todoList.todos)
  }
})

export const todoCreateLogic = createLogic({
  type: CREATE,

  processOptions: {
    dispatchReturn: true,
    successType: createTodoSucceeded,
    failType: createTodoFailed
  },

  process({ apollo, action }) {
    return apollo
      .mutate({
        mutation: ADD_TODO_MUTATION,
        variables: { text: R.path(['todo', 'text'], action.payload) }
      })
      .map(resp => resp.data.addTodo)
  }
})

export const todoToggleLogic = createLogic({
  type: TOGGLE,

  processOptions: {
    dispatchReturn: true,
    successType: toggleTodoSucceeded,
    failType: toggleTodoFailed
  },

  process({ apollo, action }) {
    return apollo
      .mutate({
        mutation: TOGGLE_TODO_MUTATION,
        variables: { id: R.prop('todoID', action.payload) }
      })
      .map(resp => resp.data.toggleTodo)
  }
})
