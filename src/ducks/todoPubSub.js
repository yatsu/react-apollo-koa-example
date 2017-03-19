import { fromJS } from 'immutable'
import { createLogic } from 'redux-logic'
import TODO_UPDATED_SUBSCRIPTION from '../graphql/todoUpdatedSubscription.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'

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

// Reducer

const initialState = fromJS({
  subid: null,
  todos: {},
  createError: null,
  toggleError: null,
  receiveError: null
})

export default function todoPubSubReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SUBSCRIBE:
      return state
    case SUBSCRIBE_SUCCEEDED:
      return state.set('subid', action.subid)
    case UNSUBSCRIBE:
      return state
    case UNSUBSCRIBE_SUCCEEDED:
      return state.set('subid', null)
    case RECEIVE_SUCCEEDED:
      return state.setIn(['todos', action.todo.id], fromJS(action.todo))
    case RECEIVE_FAILED:
      return state.set('receiveError', action.error)
    case CREATE:
      return state
    case CREATE_SUCCEEDED:
      return state
    case CREATE_FAILED:
      return state.set('createError', action.error)
    case TOGGLE:
      return state
    case TOGGLE_SUCCEEDED:
      return state
    case TOGGLE_FAILED:
      return state.set('toggleError', action.error)
    default:
      return state
  }
}

// Action Creators

export function subscribeTodos() {
  return {
    type: SUBSCRIBE
  }
}

export function subscribeTodosSucceeded(subid) {
  return {
    type: SUBSCRIBE_SUCCEEDED,
    subid
  }
}

export function unsubscribeTodos() {
  return {
    type: UNSUBSCRIBE
  }
}

export function unsubscribeTodosSucceeded(subid) {
  return {
    type: UNSUBSCRIBE_SUCCEEDED,
    subid
  }
}

export function todoReceiveSucceeded(todo) {
  return {
    type: RECEIVE_SUCCEEDED,
    todo
  }
}

export function todoReceiveFailed(error) {
  return {
    type: RECEIVE_FAILED,
    error
  }
}

export function createTodo(todo) {
  return {
    type: CREATE,
    todo
  }
}

export function createTodoSucceeded(todo) {
  return {
    type: CREATE_SUCCEEDED,
    todo
  }
}

export function createTodoFailed(error) {
  return {
    type: CREATE_FAILED,
    error
  }
}

export function toggleTodo(todoId) {
  return {
    type: TOGGLE,
    todoId
  }
}

export function toggleTodoSucceeded(todo) {
  return {
    type: TOGGLE_SUCCEEDED,
    todo
  }
}

export function toggleTodoFailed(error) {
  return {
    type: TOGGLE_FAILED,
    error
  }
}

// GraphQL Queries

// Logic

export const todoSubscribeLogic = createLogic({
  type: SUBSCRIBE,

  // eslint-disable-next-line no-unused-vars
  process({ apolloClient, subscriptions }, dispatch, done) {
    if (subscriptions.todo) {
      // eslint-disable-next-line no-underscore-dangle
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
    // eslint-disable-next-line no-underscore-dangle
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
    // eslint-disable-next-line no-underscore-dangle
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
        variables: { text: action.todo }
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
        variables: { id: action.todoId }
      })
      .then(resp => resp.data.toggleTodo)
  }
})
