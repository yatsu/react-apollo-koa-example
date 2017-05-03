// @flow
import R from 'ramda'
import { createLogic } from 'redux-logic'
import { errorMessagePath } from './paths'
import TODO_UPDATED_SUBSCRIPTION from '../graphql/todoUpdatedSubscription.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'
import type { Action, Todo } from '../types'

// Actions

const SUBSCRIBE = 'todo-pubsub/SUBSCRIBE'
const SUBSCRIBE_SUCCEEDED = 'todo-pubsub/SUBSCRIBE_SUCCEEDED'
const UNSUBSCRIBE = 'todo-pubsub/UNSUBSCRIBE'
const UNSUBSCRIBE_SUCCEEDED = 'todo-pubsub/UNSUBSCRIBE_SUCCEEDED'
const RECEIVE_SUCCEEDED = 'todo-pubsub/RECEIVE_SUCCEEDED'
const RECEIVE_FAILED = 'todo-pubsub/RECEIVE_FAILED'
const CREATE = 'todo-pubsub/CREATE'
const CREATE_SUCCEEDED = 'todo-pubsub/CREATE_SUCCEEDED'
const CREATE_FAILED = 'todo-pubsub/CREATE_FAILED'
const TOGGLE = 'todo-pubsub/TOGGLE'
const TOGGLE_SUCCEEDED = 'todo-pubsub/TOGGLE_SUCCEEDED'
const TOGGLE_FAILED = 'todo-pubsub/TOGGLE_FAILED'

// Types

type TodoPubSubState = {
  subid: ?string,
  todos: { [id: string]: Todo },
  createError: ?string,
  toggleError: ?string,
  receiveError: ?string
}

// Reducer

const initialState: TodoPubSubState = {
  subid: null,
  todos: {},
  createError: null,
  toggleError: null,
  receiveError: null
}

export function todoPubSubReducer(state: TodoPubSubState = initialState, action: Action = {}) {
  switch (action.type) {
    case SUBSCRIBE:
      return state
    case SUBSCRIBE_SUCCEEDED:
      return R.assoc('subid', R.path('subid', action.payload), state)
    case UNSUBSCRIBE:
      return state
    case UNSUBSCRIBE_SUCCEEDED:
      return R.assoc('subid', null, state)
    case RECEIVE_SUCCEEDED:
      return R.assocPath(
        ['todos', R.path(['todo', 'id'], action.payload)],
        R.prop('todo', action.payload),
        state
      )
    case RECEIVE_FAILED:
      return R.assoc('receiveError', R.path(errorMessagePath, action.payload), state)
    case CREATE:
      return state
    case CREATE_SUCCEEDED:
      return state
    case CREATE_FAILED:
      return R.assoc('createError', R.path(errorMessagePath, action.payload), state)
    case TOGGLE:
      return state
    case TOGGLE_SUCCEEDED:
      return state
    case TOGGLE_FAILED:
      return R.assoc('toggleError', R.path(errorMessagePath, action.payload), state)
    default:
      return state
  }
}

// Action Creators

export function subscribeTodos(): Action {
  return {
    type: SUBSCRIBE
  }
}

export function subscribeTodosSucceeded(subid: string): Action {
  return {
    type: SUBSCRIBE_SUCCEEDED,
    payload: {
      subid
    }
  }
}

export function unsubscribeTodos(): Action {
  return {
    type: UNSUBSCRIBE
  }
}

export function unsubscribeTodosSucceeded(subid: string): Action {
  return {
    type: UNSUBSCRIBE_SUCCEEDED,
    payload: {
      subid
    }
  }
}

export function todoReceiveSucceeded(todo: Object): Action {
  return {
    type: RECEIVE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function todoReceiveFailed(error: Object): Action {
  return {
    type: RECEIVE_FAILED,
    payload: {
      error
    }
  }
}

export function createTodo(todo: Object): Action {
  return {
    type: CREATE,
    payload: {
      todo
    }
  }
}

export function createTodoSucceeded(todo: Object): Action {
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

export function toggleTodoSucceeded(todo: Object): Action {
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

// GraphQL Queries

// Logic

export const todoSubscribeLogic = createLogic({
  type: SUBSCRIBE,

  // eslint-disable-next-line no-unused-vars
  process({ apolloClient, subscriptions }, dispatch, done) {
    if (subscriptions.todo) {
      dispatch(subscribeTodosSucceeded(subscriptions.todo._networkSubscriptionId))
      return
    }
    const sub = apolloClient.subscribe({ query: TODO_UPDATED_SUBSCRIPTION }).subscribe({
      next(payload) {
        dispatch(todoReceiveSucceeded(payload.todoUpdated))
      },
      error(err) {
        dispatch(todoReceiveFailed(err))
      }
    })
    subscriptions.todo = sub
    dispatch(subscribeTodosSucceeded(sub._networkSubscriptionId))
  }
})

export const todoUnsubscribeLogic = createLogic({
  type: UNSUBSCRIBE,
  latest: true,

  process({ apolloClient, subscriptions }, dispatch) {
    const sub = subscriptions.todo
    sub.unsubscribe()
    subscriptions.todo = null
    dispatch(unsubscribeTodosSucceeded(sub._networkSubscriptionId))
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

  process({ apolloClient, action }) {
    return apolloClient
      .mutate({
        mutation: TOGGLE_TODO_MUTATION,
        variables: { id: R.prop('todoID', action.payload) }
      })
      .then(resp => resp.data.toggleTodo)
  }
})
