// @flow
import R from 'ramda'
import { createAction, createReducer } from 'redux-act'
import { createLogic } from 'redux-logic'
import TODO_LIST_QUERY from '../graphql/todoListQuery.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'
import { errorObject } from '../utils'
import type { ErrorType, Todo } from '../types'

// Types

type TodoRemoteState = {
  todos: { [string]: Todo },
  fetching: boolean,
  fetchError: ?string,
  createError: ?string,
  toggleError: ?string
}

// Actions

export const todoRemoteFetch = createAction('TODO_REMOTE_FETCH')
export const todoRemoteFetchSucceeded = createAction('TODO_REMOTE_FETCH_SUCCEDED')
export const todoRemoteFetchFailed = createAction('TODO_REMOTE_FETCH_FAILED')
export const todoRemoteCreate = createAction('TODO_REMOTE_CREATE')
export const todoRemoteCreateSucceeded = createAction('TODO_REMOTE_CREATE_SUCCEEDED')
export const todoRemoteCreateFailed = createAction('TODO_REMOTE_CREATE_FAILED')
export const todoRemoteToggle = createAction('TODO_REMOTE_TOGGLE')
export const todoRemoteToggleSucceeded = createAction('TODO_REMOTE_TOGGLE_SUCCEEDED')
export const todoRemoteToggleFailed = createAction('TODO_REMOTE_TOGGLE_FAILED')

// Reducer

const initialState: TodoRemoteState = {
  todos: {},
  fetching: false,
  fetchError: null,
  createError: null,
  toggleError: null
}

export const todoRemoteReducer = createReducer(
  {
    [todoRemoteFetch]: (state: TodoRemoteState): TodoRemoteState =>
      R.merge(state, {
        fetching: true
      }),

    [todoRemoteFetchSucceeded]: (state: TodoRemoteState, payload: Array<Todo>): TodoRemoteState =>
      R.merge(state, {
        fetching: false,
        todos: R.reduce(
          (acc: { [string]: Todo }, todo: Todo) => R.assoc(todo.id, todo, acc),
          {},
          payload
        )
      }),

    [todoRemoteFetchFailed]: (state: TodoRemoteState, payload: ErrorType): TodoRemoteState =>
      R.merge(state, {
        fetching: false,
        fetchError: errorObject(payload)
      }),

    [todoRemoteCreate]: (state: TodoRemoteState): TodoRemoteState => state,

    [todoRemoteCreateSucceeded]: (state: TodoRemoteState): TodoRemoteState => state,

    [todoRemoteCreateFailed]: (state: TodoRemoteState, payload: ErrorType): TodoRemoteState =>
      R.merge(state, {
        createError: errorObject(payload)
      }),

    [todoRemoteToggle]: (state: TodoRemoteState): TodoRemoteState => state,

    [todoRemoteToggleSucceeded]: (state: TodoRemoteState, payload: Todo): TodoRemoteState =>
      R.merge(state, {
        todos: R.assoc(payload.id, payload, state.todos)
      }),

    [todoRemoteToggleFailed]: (state: TodoRemoteState, payload: ErrorType): TodoRemoteState =>
      R.merge(state, {
        toggleError: errorObject(payload)
      })
  },
  initialState
)

// Logic

export const todosFetchLogic = createLogic({
  type: [todoRemoteFetch, todoRemoteCreateSucceeded],

  processOptions: {
    dispatchReturn: true,
    successType: todoRemoteFetchSucceeded,
    failType: todoRemoteFetchFailed
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
  type: todoRemoteCreate,

  processOptions: {
    dispatchReturn: true,
    successType: todoRemoteCreateSucceeded,
    failType: todoRemoteCreateFailed
  },

  process({ apollo, action }) {
    return apollo
      .mutate({
        mutation: ADD_TODO_MUTATION,
        variables: { text: action.payload.text }
      })
      .map(resp => resp.data.addTodo)
  }
})

export const todoToggleLogic = createLogic({
  type: todoRemoteToggle,

  processOptions: {
    dispatchReturn: true,
    successType: todoRemoteToggleSucceeded,
    failType: todoRemoteToggleFailed
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
