// @flow
import R from 'ramda'
import { createLogic } from 'redux-logic'
import { errorMessagePath } from './paths'
import TODO_UPDATED_SUBSCRIPTION from '../graphql/todoUpdatedSubscription.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'
import type { Todo, ErrorType } from '../types'

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

type TodoAction = {
  type?: string,
  payload?: {
    todo?: Todo,
    error?: ErrorType
  }
}

type TodoToggleAction = {
  type?: string,
  payload?: {
    todoID: string
  }
}

type TodoSubscribeAction = {
  type?: string,
  payload?: {
    subid?: string,
    error?: ErrorType
  }
}

type TodoPubSubState = {
  subid: ?string,
  todos: { [id: string]: Todo },
  createError: ?string,
  toggleError: ?string,
  receiveError: ?string
}

// Paths

export const todosPath = ['todos']
export const subidPath = ['subid']
export const todoPath = ['todo']
export const todoTextPath = ['todo', 'text']
export const todoIDPath = ['todo', 'text']
export const createErrorPath = ['createErrorPath']
export const toggleErrorPath = ['toggleErrorPath']
export const receiveErrorPath = ['receiveErrorPath']
export const topTodoIDPath = ['todoID']

// Reducer

const initialState: TodoPubSubState = {
  subid: null,
  todos: {},
  createError: null,
  toggleError: null,
  receiveError: null
}

export function todoPubSubReducer(
  state: TodoPubSubState = initialState,
  action: TodoAction | TodoToggleAction | TodoSubscribeAction = {}
) {
  switch (action.type) {
    case SUBSCRIBE:
      return state
    case SUBSCRIBE_SUCCEEDED:
      return R.assocPath(subidPath, R.path(subidPath, action.payload), state)
    case UNSUBSCRIBE:
      return state
    case UNSUBSCRIBE_SUCCEEDED:
      return R.assocPath(subidPath, null, state)
    case RECEIVE_SUCCEEDED:
      return R.assocPath(
        [...todosPath, R.path(todoIDPath, action.payload)],
        R.path(todoPath, action.payload),
        state
      )
    case RECEIVE_FAILED:
      return R.assocPath(receiveErrorPath, R.path(errorMessagePath, action.payload), state)
    case CREATE:
      return state
    case CREATE_SUCCEEDED:
      return state
    case CREATE_FAILED:
      return R.assocPath(createErrorPath, R.path(errorMessagePath, action.payload), state)
    case TOGGLE:
      return state
    case TOGGLE_SUCCEEDED:
      return state
    case TOGGLE_FAILED:
      return R.assocPath(toggleErrorPath, R.path(errorMessagePath, action.payload), state)
    default:
      return state
  }
}

// Action Creators

export function subscribeTodos(): TodoAction {
  return {
    type: SUBSCRIBE
  }
}

export function subscribeTodosSucceeded(subid: string): TodoAction {
  return {
    type: SUBSCRIBE_SUCCEEDED,
    payload: {
      subid
    }
  }
}

export function unsubscribeTodos(): TodoSubscribeAction {
  return {
    type: UNSUBSCRIBE
  }
}

export function unsubscribeTodosSucceeded(subid: string): TodoSubscribeAction {
  return {
    type: UNSUBSCRIBE_SUCCEEDED,
    payload: {
      subid
    }
  }
}

export function todoReceiveSucceeded(todo: Object): TodoAction {
  return {
    type: RECEIVE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function todoReceiveFailed(error: Object): TodoAction {
  return {
    type: RECEIVE_FAILED,
    payload: {
      error
    }
  }
}

export function createTodo(todo: Object): TodoAction {
  return {
    type: CREATE,
    payload: {
      todo
    }
  }
}

export function createTodoSucceeded(todo: Object): TodoAction {
  return {
    type: CREATE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function createTodoFailed(error: Object): TodoAction {
  return {
    type: CREATE_FAILED,
    paylaod: {
      error
    }
  }
}

export function toggleTodo(todoID: string): TodoAction {
  return {
    type: TOGGLE,
    payload: {
      todoID
    }
  }
}

export function toggleTodoSucceeded(todo: Object): TodoAction {
  return {
    type: TOGGLE_SUCCEEDED,
    payload: {
      todo
    }
  }
}

export function toggleTodoFailed(error: Object): TodoAction {
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

  process({ apolloClient, action }) {
    return apolloClient
      .mutate({
        mutation: ADD_TODO_MUTATION,
        variables: { text: R.path(todoTextPath, action.payload) }
      })
      .then(resp => resp.data.addTodo)
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
        variables: { id: R.path(topTodoIDPath, action.payload) }
      })
      .then(resp => resp.data.toggleTodo)
  }
})
