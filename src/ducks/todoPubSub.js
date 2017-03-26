// @flow
import R from 'ramda'
import { Map, fromJS } from 'immutable'
import { createLogic } from 'redux-logic'
import { Todo } from '../types/todo'
import { ErrorType } from '../types/error'
import { payloadLens, errorMessageLens } from './actionLenses'
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

// Types

type TodoAction = {
  type?: string,
  payload?: {
    todo?: Todo,
    error?: ErrorType
  }
};

type TodoToggleAction = {
  type?: string,
  payload?: {
    todoID: string
  }
};

type TodoSubscribeAction = {
  type?: string,
  payload?: {
    subid?: string,
    error?: ErrorType
  }
};

// Lenses

const todoLens = R.compose(payloadLens, R.lensProp('todo'))
const todoTextLens = R.compose(todoLens, R.lensProp('text'))
const todoIDLens = R.compose(payloadLens, R.lensProp('todoID'))
const subidLens = R.compose(payloadLens, R.lensProp('subid'))

// Reducer

const initialState = fromJS({
  subid: null,
  todos: {},
  createError: null,
  toggleError: null,
  receiveError: null
})

export default function todoPubSubReducer(
  state: Map<string, any> = initialState,
  action: TodoAction | TodoToggleAction | TodoSubscribeAction = {}
) {
  switch (action.type) {
    case SUBSCRIBE:
      return state
    case SUBSCRIBE_SUCCEEDED:
      return state.set('subid', R.view(subidLens, action))
    case UNSUBSCRIBE:
      return state
    case UNSUBSCRIBE_SUCCEEDED:
      return state.set('subid', null)
    case RECEIVE_SUCCEEDED:
      return (() => {
        const todo = R.view(todoLens, action)
        return state.setIn(['todos', todo.id], fromJS(todo))
      })()
    case RECEIVE_FAILED:
      return state.set('receiveError', R.view(errorMessageLens, action))
    case CREATE:
      return state
    case CREATE_SUCCEEDED:
      return state
    case CREATE_FAILED:
      return state.set('createError', R.view(errorMessageLens, action))
    case TOGGLE:
      return state
    case TOGGLE_SUCCEEDED:
      return state
    case TOGGLE_FAILED:
      return state.set('toggleError', R.view(errorMessageLens, action))
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
        variables: { text: R.view(todoTextLens, action) }
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
        variables: { id: R.view(todoIDLens, action) }
      })
      .then(resp => resp.data.toggleTodo)
  }
})
